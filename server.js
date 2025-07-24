const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Import routes and utilities
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/courses');
const adminRoutes = require('./routes/admin');
const { connectDatabase, initializeDatabase } = require('./db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:62184', 'http://127.0.0.1:4200', 'http://127.0.0.1:62184'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/certificates', express.static(path.join(__dirname, 'certificates')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);

// PDF Generation endpoint
app.post('/api/generate-certificate', async (req, res) => {
  console.log('🚨 ENDPOINT HIT: /api/generate-certificate');
  console.log('📝 Request body:', req.body);
  console.log('📝 Request headers:', req.headers);
  
  try {
    console.log('🔵 Certificate generation request received:', req.body);
    const { name, email, course, completion_date } = req.body;

    if (!name || !email || !course || !completion_date) {
      console.log('❌ Missing required fields:', { name, email, course, completion_date });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, course, completion_date'
      });
    }
    
    console.log('✅ All required fields present');
    
    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, 'certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
      console.log('📁 Created certificates directory');
    }

    const filename = `${name.replace(/[^a-zA-Z0-9]/g, '_')}_certificate.pdf`;
    const filePath = path.join(certificatesDir, filename);
    console.log('📄 Will create PDF file:', filePath);

    console.log('📝 Starting PDF generation...');
    
    // Create PDF with professional design
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Create write stream
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Set cream background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FDF5E6');
    
    // Add black border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(3)
       .stroke('#000000');

    // Calculate center positions
    const centerX = doc.page.width / 2;
    const startY = 100;
    const lineHeight = 40;

    // Title: "CERTIFICATE OF COMPLETION"
    doc.font('Times-Bold')
       .fontSize(36)
       .fill('#000000')
       .text('CERTIFICATE OF COMPLETION', centerX, startY, {
         align: 'center'
       });

    // "Presented to" text
    doc.font('Times-Roman')
       .fontSize(18)
       .fill('#000000')
       .text('Presented to', centerX, startY + lineHeight * 2, {
         align: 'center'
       });

    // Recipient name (big and bold)
    doc.font('Times-Bold')
       .fontSize(32)
       .fill('#000000')
       .text(name, centerX, startY + lineHeight * 3.5, {
         align: 'center'
       });

    // "For completing:" text
    doc.font('Times-Roman')
       .fontSize(18)
       .fill('#000000')
       .text('For completing:', centerX, startY + lineHeight * 5, {
         align: 'center'
       });

    // Course name (larger and bold)
    doc.font('Times-Bold')
       .fontSize(24)
       .fill('#000000')
       .text(course, centerX, startY + lineHeight * 6.5, {
         align: 'center'
       });

    // Date
    doc.font('Times-Roman')
       .fontSize(18)
       .fill('#000000')
       .text(`Date: ${completion_date}`, centerX, startY + lineHeight * 8, {
         align: 'center'
       });

    // Bottom left: Blue logo icon
    doc.fontSize(24)
       .fill('#0066CC')
       .text('🏆', 80, doc.page.height - 120);

    // Bottom right: Signature image
    const signaturePath = path.join(__dirname, 'signature.png');
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, doc.page.width - 200, doc.page.height - 140, {
        width: 120,
        height: 60
      });
    } else {
      // Fallback to text signature if image doesn't exist
      doc.font('Times-Italic')
         .fontSize(16)
         .fill('#000000')
         .text('Jane Smith', doc.page.width - 150, doc.page.height - 140, {
           align: 'center'
         });
      
      // Signature line
      doc.moveTo(doc.page.width - 200, doc.page.height - 120)
         .lineTo(doc.page.width - 100, doc.page.height - 120)
         .lineWidth(2)
         .stroke('#000000');
    }

    console.log('📝 PDF content added, ending document...');
    
    // End the document
    doc.end();

    // Wait for PDF to finish writing
    writeStream.on('finish', async () => {
      console.log('✅ PDF file created successfully');
      
      // Save certificate record to database
      try {
        console.log('💾 Starting database operations...');
        const { getDatabase } = require('./db');
        const db = getDatabase();
        
        // First, create or get user
        console.log('🔍 Checking for existing user...');
        const [existingUsers] = await db.execute(
          'SELECT id FROM users WHERE email = ?',
          [email]
        );

        let userId;
        if (existingUsers.length > 0) {
          userId = existingUsers[0].id;
          console.log('✅ Found existing user with ID:', userId);
        } else {
          // Create new user
          console.log('➕ Creating new user...');
          const [userResult] = await db.execute(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
          );
          userId = userResult.insertId;
          console.log('✅ Created new user with ID:', userId);
        }

        // Save certificate record
        console.log('💾 Saving certificate record...');
        await db.execute(
          'INSERT INTO certificates (user_id, certificate_type, recipient_name, issue_date, file_path) VALUES (?, ?, ?, ?, ?)',
          [userId, course, name, completion_date, filename]
        );
        console.log('✅ Certificate record saved successfully');

        const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        res.json({
          success: true,
          message: 'Certificate generated successfully',
          data: {
            filename: filename,
            downloadUrl: `/certificates/${filename}`,
            certificateId: certificateId
          }
        });
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        res.status(500).json({
          success: false,
          message: 'Database error: ' + dbError.message
        });
      }
    });

    writeStream.on('error', (error) => {
      console.error('❌ PDF write error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating PDF file'
      });
    });



  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating certificate'
    });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer(); 