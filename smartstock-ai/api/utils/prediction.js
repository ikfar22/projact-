/**
 * Predictive Algorithm: คำนวณสถานะและวันที่สินค้าจะหมด
 * Logic เดียวกับ frontend แต่ใช้บน backend
 */

function predictStockStatus(product) {
  const { quantity, daily_sales, reorder_point } = product;
  const daysUntilEmpty = daily_sales > 0 ? quantity / daily_sales : Infinity;
  const daysUntilReorder = daily_sales > 0 ? (quantity - reorder_point) / daily_sales : Infinity;

  let status;
  if (quantity <= 0) {
    status = 'out';
  } else if (daysUntilEmpty <= 3) {
    status = 'critical';
  } else if (daysUntilEmpty <= 7 || daysUntilReorder <= 0) {
    status = 'warning';
  } else {
    status = 'normal';
  }

  return {
    daysUntilEmpty,
    daysUntilReorder,
    status,
  };
}

function getCriticalProducts(products) {
  return products.filter(p => {
    const { status } = predictStockStatus(p);
    return status === 'critical' || status === 'out';
  });
}

function calculateBurnRate(products) {
  if (products.length === 0) return 0;
  const totalSales = products.reduce((sum, p) => sum + (p.daily_sales || 0), 0);
  return totalSales / products.length;
}

function calculateTotalValue(products) {
  return products.reduce((sum, p) => sum + ((p.quantity || 0) * (p.price_per_unit || 0)), 0);
}

module.exports = { predictStockStatus, getCriticalProducts, calculateBurnRate, calculateTotalValue };
