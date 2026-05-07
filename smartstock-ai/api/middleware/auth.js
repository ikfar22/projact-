const jwt = require('jsonwebtoken');

// JWT secret - use env variable or fallback to a default
const JWT_SECRET = process.env.JWT_SECRET || 'smartstock-secret-key-change-in-production';

/**
 * Middleware: verify JWT from Authorization header.
 * Expects: "Bearer <token>"
 * Attaches: req.user = { userId, username }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'ไม่มี token: กรุณาเข้าสู่ระบบ' });
  }

  const token = authHeader.split(' ')[1]; // Extract "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'รูปแบบ token ไม่ถูกต้อง' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, username }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'token ไม่ถูกต้องหรือหมดอายุ' });
  }
}

module.exports = { authenticate, JWT_SECRET };
