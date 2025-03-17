const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [username, password, email] // หมายเหตุ: ใน production ควร hash password
    );
    res.json({ id: result.insertId, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    console.log('POST /api/auth/login - Body:', req.body); // Debug
    const [users] = await db.query(
      'SELECT id, username, role FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
    const user = users[0];
    console.log('Logged in user:', user); // Debug
    res.json({ id: user.id, username: user.username, role: user.role }); // ส่ง role ด้วย
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    res.status(500).json({ error: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลได้' });
  }
});

module.exports = router;