const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all users
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/users - Fetching all users');
    const [rows] = await db.query('SELECT id, username, created_at FROM users');
    console.log('Users fetched:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;