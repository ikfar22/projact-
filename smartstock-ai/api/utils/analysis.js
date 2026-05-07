/**
 * ABC Analysis & Smart Order Quantity (EOQ Lite)
 * วิเคราะห์จัดกลุ่มสินค้าและคำนวณจำนวนสั่งซื้อที่แนะนำ
 */

/**
 * ABC Analysis — จัดกลุ่มสินค้าตามมูลค่าและความเร็วในการขาย
 * Group A: สินค้าขายดี (daily_sales >= 5) หรือมีมูลค่าสูง (>= 50% ของสินค้าทั้งหมด)
 * Group C: Deadstock — ไม่มีการเคลื่อนไหว (daily_sales = 0) หรือหมดแล้ว
 * Group B: ปกติ — อยู่ระหว่างกลาง
 */
function calculateABCGroup(product, allProducts) {
  // Deadstock check: no movement
  if (product.daily_sales === 0 || product.quantity <= 0) {
    // Check if truly dead — no sales in 30 days (handled by caller with sales data)
    if (product.daily_sales === 0) return 'C';
    // If quantity is 0 but has velocity, it's critical A
    if (product.daily_sales >= 5) return 'A';
  }

  // Calculate total value across all products
  const totalValue = allProducts.reduce(
    (sum, p) => sum + (p.quantity * p.price_per_unit), 0
  );

  const productValue = product.quantity * product.price_per_unit;

  // High velocity or high value → Group A
  if (product.daily_sales >= 5 || (totalValue > 0 && productValue / totalValue >= 0.15)) {
    return 'A';
  }

  // Group C: slow movers with low stock relative to reorder point
  if (product.daily_sales < 0.5 && product.quantity <= product.reorder_point) {
    return 'C';
  }

  return 'B';
}

/**
 * Smart Order Quantity (EOQ Lite)
 * คำนวณว่าควรสั่งซื้อกี่หน่วย เพื่อไม่ให้ขาดและไม่ให้ล้นสต็อก
 * SOQ = (daily_sales * lead_time) + safety_stock - current_quantity
 * lead_time = 3 วัน (ค่าเริ่มต้น), safety_stock = reorder_point * 0.5
 */
function calculateSOQ(product) {
  const leadTime = 3; // days
  const safetyStock = product.reorder_point * 0.5;
  const demandDuringLeadTime = product.daily_sales * leadTime;
  const soq = Math.ceil(demandDuringLeadTime + safetyStock - product.quantity);
  return Math.max(0, soq);
}

module.exports = { calculateABCGroup, calculateSOQ };
