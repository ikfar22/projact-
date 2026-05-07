const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { get, run } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * สร้างบัญชีผู้ใช้ใหม่ — เข้ารหัสรหัสผ่านด้วย bcrypt
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, shop_name } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'ต้องกรอก username และ password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existing = await get('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      return res.status(409).json({ error: 'username นี้มีผู้ใช้งานแล้ว' });
    }

    // เข้ารหัสรหัสผ่านด้วย bcrypt (salt rounds = 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // บันทึกผู้ใช้ใหม่
    const result = await run(
      'INSERT INTO users (username, password_hash, shop_name) VALUES (?, ?, ?)',
      [username, passwordHash, shop_name || '']
    );

    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      user: { id: result.id, username, shop_name: shop_name || '' },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

/**
 * POST /api/auth/login
 * เข้าสู่ระบบ — ตรวจสอบรหัสผ่านและส่ง JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'ต้องกรอก username และ password' });
    }

    // ค้นหาผู้ใช้
    const user = await get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(401).json({ error: 'username หรือ password ไม่ถูกต้อง' });
    }

    // เปรียบเทียบรหัสผ่านกับ hash ที่เก็บไว้
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'username หรือ password ไม่ถูกต้อง' });
    }

    // สร้าง JWT token (อายุ 24 ชั่วโมง)
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: { id: user.id, username: user.username, shop_name: user.shop_name },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

module.exports = router;
