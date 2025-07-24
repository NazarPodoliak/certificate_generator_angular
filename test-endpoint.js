const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test server is working!' });
});

// Test certificate endpoint
app.post('/api/generate-certificate', (req, res) => {
  console.log('🔵 Test server received certificate request:', req.body);
  
  // Just return a success response immediately
  res.json({
    success: true,
    message: 'Test certificate generated',
    data: {
      filename: 'test_certificate.pdf',
      downloadUrl: '/test.pdf',
      certificateId: 'TEST-123'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔗 Certificate endpoint: http://localhost:${PORT}/api/generate-certificate`);
}); 