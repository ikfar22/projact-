const express = require('express');
const router = express.Router();
const { all } = require('../db');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

/**
 * GET /api/sales
 * ดึงประวัติการขายทั้งหมด พร้อมข้อมูลสินค้า
 */
router.get('/', async (req, res) => {
  try {
    const sales = await all(`
      SELECT
        sl.id,
        sl.inventory_id,
        sl.quantity,
        sl.sale_date,
        i.name as product_name
      FROM sales_logs sl
      JOIN inventory i ON sl.inventory_id = i.id
      WHERE sl.user_id = ?
      ORDER BY sl.sale_date DESC
    `, [req.user.userId]);

    res.json(sales);
  } catch (err) {
    console.error('Sales GET error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงประวัติการขาย' });
  }
});

module.exports = router;
