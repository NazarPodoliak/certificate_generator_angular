const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const [results] = await db.execute('SELECT * FROM courses ORDER BY course_name');
    
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving courses'
    });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const courseId = req.params.id;
    
    const [rows] = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching course'
    });
  }
});

// Create new course
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { course_name } = req.body;
    
    if (!course_name) {
      return res.status(400).json({
        success: false,
        message: 'Course name is required'
      });
    }
    
    const [result] = await db.execute('INSERT INTO courses (course_name) VALUES (?)', [course_name]);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: {
        id: result.insertId,
        course_name
      }
    });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating course'
    });
  }
});

module.exports = router; 