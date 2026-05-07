const express = require('express');
const router = express.Router();
const { get, all, run } = require('../db');
const { authenticate } = require('../middleware/auth');
const { predictStockStatus } = require('../utils/prediction');
const { calculateABCGroup, calculateSOQ } = require('../utils/analysis');
const { calculateMargin } = require('../utils/margin');

// ทุก route ในไฟล์นี้ต้องผ่านการตรวจสอบ token
router.use(authenticate);

// Helper: enrich product with prediction, ABC group, SOQ, margin
function enrichProduct(p, allProducts) {
  return {
    ...p,
    prediction: predictStockStatus(p),
    abc_group: calculateABCGroup(p, allProducts || []),
    suggested_order_quantity: calculateSOQ(p),
    margin: calculateMargin(p),
  };
}

// Helper: log inventory activity
async function logActivity(userId, action, inventoryId, inventoryName, data) {
  await run(
    `INSERT INTO inventory_logs (user_id, action, inventory_id, inventory_name, quantity_change, old_quantity, new_quantity, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      action,
      inventoryId,
      inventoryName,
      data.quantity_change || 0,
      data.old_quantity || null,
      data.new_quantity || null,
      data.note || '',
    ]
  );
}

/**
 * GET /api/inventory
 * ดึงรายการสินค้าทั้งหมด พร้อม AI Prediction, ABC, SOQ, Margin
 */
router.get('/', async (req, res) => {
  try {
    const products = await all('SELECT * FROM inventory WHERE user_id = ? ORDER BY quantity / NULLIF(daily_sales, 0) ASC', [req.user.userId]);
    const result = products.map(p => enrichProduct(p, products));
    res.json(result);
  } catch (err) {
    console.error('Inventory GET error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  }
});

/**
 * POST /api/inventory
 * เพิ่มสินค้าใหม่
 */
router.post('/', async (req, res) => {
  try {
    const { name, quantity, daily_sales, reorder_point, price_per_unit, location, cost_per_unit } = req.body;

    if (!name || quantity == null) {
      return res.status(400).json({ error: 'ต้องกรอกชื่อสินค้าและจำนวน' });
    }

    const result = await run(
      `INSERT INTO inventory (user_id, name, quantity, daily_sales, reorder_point, price_per_unit, location, cost_per_unit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, name, quantity || 0, daily_sales || 0, reorder_point || 0, price_per_unit || 0, location || 'โซน A', cost_per_unit || 0]
    );

    const product = await get('SELECT * FROM inventory WHERE id = ?', [result.id]);

    await logActivity(req.user.userId, 'add', result.id, name, {
      quantity_change: quantity || 0,
      new_quantity: quantity || 0,
      note: `เพิ่มสินค้าใหม่ — ${location || 'โซน A'}`,
    });

    res.status(201).json(enrichProduct(product));
  } catch (err) {
    console.error('Inventory POST error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' });
  }
});

/**
 * PUT /api/inventory/:id
 * แก้ไขข้อมูลสินค้า
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, daily_sales, reorder_point, price_per_unit, location, cost_per_unit } = req.body;

    const existing = await get('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [id, req.user.userId]);
    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    const newQty = quantity !== undefined ? quantity : existing.quantity;
    const qtyChange = newQty - existing.quantity;

    await run(
      `UPDATE inventory
       SET name = COALESCE(?, name),
           quantity = COALESCE(?, quantity),
           daily_sales = COALESCE(?, daily_sales),
           reorder_point = COALESCE(?, reorder_point),
           price_per_unit = COALESCE(?, price_per_unit),
           location = COALESCE(?, location),
           cost_per_unit = COALESCE(?, cost_per_unit),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, quantity, daily_sales, reorder_point, price_per_unit, location, cost_per_unit, id]
    );

    const product = await get('SELECT * FROM inventory WHERE id = ?', [id]);

    if (qtyChange !== 0 || name !== existing.name) {
      await logActivity(req.user.userId, 'edit', id, product.name, {
        quantity_change: qtyChange,
        old_quantity: existing.quantity,
        new_quantity: newQty,
        note: name && name !== existing.name ? `เปลี่ยนชื่อจาก "${existing.name}" เป็น "${name}"` : 'แก้ไขข้อมูลสินค้า',
      });
    }

    res.json(enrichProduct(product));
  } catch (err) {
    console.error('Inventory PUT error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการแก้ไขสินค้า' });
  }
});

/**
 * POST /api/inventory/:id/transfer
 * ย้ายสินค้าระหว่างโซน
 */
router.post('/:id/transfer', async (req, res) => {
  try {
    const { id } = req.params;
    const { to_location } = req.body;

    if (!to_location) {
      return res.status(400).json({ error: 'ต้องระบุโซนปลายทาง' });
    }

    const product = await get('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [id, req.user.userId]);
    if (!product) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    const oldLocation = product.location || 'โซน A';
    await run('UPDATE inventory SET location = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [to_location, id, req.user.userId]);

    await logActivity(req.user.userId, 'transfer', id, product.name, {
      old_quantity: 0,
      new_quantity: 0,
      note: `ย้ายจาก "${oldLocation}" ไป "${to_location}" จำนวน ${product.quantity} ชิ้น`,
    });

    const updated = await get('SELECT * FROM inventory WHERE id = ?', [id]);
    res.json({ message: 'ย้ายโซนสำเร็จ', product: enrichProduct(updated) });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการย้ายโซน' });
  }
});

/**
 * POST /api/inventory/reconcile
 * ตรวจนับสต็อก — อัปเดตจำนวนจริงและบันทึกส่วนต่าง
 */
router.post('/reconcile', async (req, res) => {
  try {
    const { items } = req.body; // [{ id, actual_quantity, reason, note }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'ต้องระบุรายการสินค้า' });
    }

    const results = [];
    for (const item of items) {
      const product = await get('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [item.id, req.user.userId]);
      if (!product) continue;

      const actualQty = Math.max(0, item.actual_quantity ?? 0);
      const variance = actualQty - product.quantity;

      // บันทึกส่วนต่างถ้ามีการเปลี่ยนแปลง
      if (variance !== 0) {
        await run('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [actualQty, item.id, req.user.userId]);

        await logActivity(req.user.userId, 'reconciliation', item.id, product.name, {
          quantity_change: variance,
          old_quantity: product.quantity,
          new_quantity: actualQty,
          note: `ตรวจนับสต็อก — เหตุผล: ${item.reason || 'อื่นๆ'} | ${item.note || ''}`,
        });

        results.push({
          id: item.id,
          name: product.name,
          old_quantity: product.quantity,
          new_quantity: actualQty,
          variance,
        });
      }
    }

    res.json({ message: 'ตรวจนับสต็อกสำเร็จ', reconciled: results });
  } catch (err) {
    console.error('Reconcile error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจนับสต็อก' });
  }
});

/**
 * DELETE /api/inventory/:id
 * ลบสินค้า
 */
router.delete('/:id', async (req, res) => {
  try {
    const existing = await get('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    await logActivity(req.user.userId, 'delete', existing.id, existing.name, {
      quantity_change: -existing.quantity,
      old_quantity: existing.quantity,
      new_quantity: 0,
      note: 'ลบสินค้าออกจากระบบ',
    });

    await run('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (err) {
    console.error('Inventory DELETE error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลบสินค้า' });
  }
});

/**
 * POST /api/inventory/sale
 * บันทึกการขาย — ตัดสต็อก และบันทึกประวัติ
 */
router.post('/sale', async (req, res) => {
  try {
    const { inventory_id, quantity } = req.body;

    if (!inventory_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'ต้องระบุสินค้าและจำนวนที่ขาย' });
    }

    const product = await get('SELECT * FROM inventory WHERE id = ? AND user_id = ?', [inventory_id, req.user.userId]);
    if (!product) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    const newQuantity = Math.max(0, product.quantity - quantity);

    await run('UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [newQuantity, inventory_id, req.user.userId]);

    await run(
      'INSERT INTO sales_logs (user_id, inventory_id, quantity) VALUES (?, ?, ?)',
      [req.user.userId, inventory_id, quantity]
    );

    await logActivity(req.user.userId, 'sale', inventory_id, product.name, {
      quantity_change: -quantity,
      old_quantity: product.quantity,
      new_quantity: newQuantity,
      note: `ตัดสต็อกจากการขาย ${quantity} ชิ้น`,
    });

    const updatedProduct = await get('SELECT * FROM inventory WHERE id = ?', [inventory_id]);
    res.json({
      message: 'บันทึกการขายสำเร็จ',
      product: enrichProduct(updatedProduct),
    });
  } catch (err) {
    console.error('Sale POST error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการบันทึกการขาย' });
  }
});

module.exports = router;
