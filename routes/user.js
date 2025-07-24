const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const [rows] = await db.execute('SELECT * FROM users ORDER BY created_at DESC');
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({
          success: false,
          message: 'Error fetching user'
        });
      } else if (!row) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      } else {
        res.json({
          success: true,
          data: row
        });
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { name, email, certificate_data } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    const query = `
      INSERT INTO users (name, email, certificate_data) 
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [name, email, certificate_data || null]);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        certificate_data
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    const { name, email, certificate_data } = req.body;
    
    const query = `
      UPDATE users 
      SET name = ?, email = ?, certificate_data = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [name, email, certificate_data, userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

// Get user certificates
router.get('/:id/certificates', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    
    const [rows] = await db.execute('SELECT * FROM certificates WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('Error fetching certificates:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates'
    });
  }
});

// Create certificate for user
router.post('/:id/certificates', async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.params.id;
    const { certificate_type, recipient_name, issue_date, certificate_data, file_path } = req.body;
    
    if (!certificate_type || !recipient_name || !issue_date) {
      return res.status(400).json({
        success: false,
        message: 'Certificate type, recipient name, and issue date are required'
      });
    }
    
    const query = `
      INSERT INTO certificates (user_id, certificate_type, recipient_name, issue_date, certificate_data, file_path) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [userId, certificate_type, recipient_name, issue_date, certificate_data || null, file_path || null]);
    
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: {
        id: result.insertId,
        user_id: userId,
        certificate_type,
        recipient_name,
        issue_date,
        certificate_data,
        file_path
      }
    });
  } catch (err) {
    console.error('Error creating certificate:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating certificate'
    });
  }
});

module.exports = router; 