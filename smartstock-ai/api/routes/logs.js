const express = require('express');
const router = express.Router();
const { all } = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * GET /api/logs
 * ดึงประวัติกิจกรรมสต็อกล่าสุด (default 20 รายการ)
 * Query params: limit (default 20), action (filter by type)
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const actionFilter = req.query.action || null;

    let sql = `
      SELECT
        il.id,
        il.user_id,
        il.action,
        il.inventory_id,
        il.inventory_name,
        il.quantity_change,
        il.old_quantity,
        il.new_quantity,
        il.note,
        il.created_at,
        u.username
      FROM inventory_logs il
      LEFT JOIN users u ON il.user_id = u.id
      WHERE il.user_id = ?
    `;

    const params = [req.user.userId];
    if (actionFilter) {
      sql += ' AND il.action = ?';
      params.push(actionFilter);
    }

    sql += ' ORDER BY il.created_at DESC LIMIT ?';
    params.push(limit);

    const logs = await all(sql, params);
    res.json(logs);
  } catch (err) {
    console.error('Logs GET error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงประวัติกิจกรรม' });
  }
});

module.exports = router;
