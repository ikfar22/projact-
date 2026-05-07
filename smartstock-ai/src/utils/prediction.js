// Helper: normalize product fields to handle both API (snake_case) and legacy (camelCase) names
function getField(product, snake, camel) {
  return product[snake] !== undefined ? product[snake] : (product[camel] !== undefined ? product[camel] : 0);
}

export function predictStockStatus(product) {
  const quantity = product.quantity ?? 0;
  const dailySales = getField(product, 'daily_sales', 'dailySales');
  const reorderPoint = getField(product, 'reorder_point', 'reorderPoint');

  const daysUntilEmpty = dailySales > 0 ? quantity / dailySales : Infinity;
  const daysUntilReorder = dailySales > 0 ? (quantity - reorderPoint) / dailySales : Infinity;

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

export function getStatusColor(status) {
  switch (status) {
    case 'out': return { bg: 'bg-red-100/60', text: 'text-red-700', dot: 'bg-red-500', label: 'สินค้าหมด' };
    case 'critical': return { bg: 'bg-red-100/60', text: 'text-red-700', dot: 'bg-red-400', label: 'วิกฤต' };
    case 'warning': return { bg: 'bg-amber-100/60', text: 'text-amber-700', dot: 'bg-amber-400', label: 'ควรระวัง' };
    case 'normal': return { bg: 'bg-emerald-100/60', text: 'text-emerald-700', dot: 'bg-emerald-400', label: 'ปกติ' };
    default: return { bg: 'bg-slate-100/60', text: 'text-slate-700', dot: 'bg-slate-400', label: 'ไม่ทราบ' };
  }
}

export function generateTrendData(products) {
  const days = 7;
  const trendData = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - d));
    const dayLabel = date.toLocaleDateString('th-TH', { weekday: 'short' });
    const point = { day: dayLabel };

    let lowStockCount = 0;
    products.forEach(p => {
      const dailySales = getField(p, 'daily_sales', 'dailySales');
      const reorderPoint = getField(p, 'reorder_point', 'reorderPoint');
      const projectedQty = p.quantity - (dailySales * (days - 1 - d));
      if (projectedQty <= reorderPoint) {
        lowStockCount++;
      }
    });

    point['สินค้าใกล้หมด'] = lowStockCount;
    trendData.push(point);
  }

  return trendData;
}

export function calculateBurnRate(products) {
  if (products.length === 0) return 0;
  const totalSales = products.reduce((sum, p) => sum + getField(p, 'daily_sales', 'dailySales'), 0);
  return totalSales / products.length;
}

export function calculateTotalValue(products) {
  return products.reduce((sum, p) => sum + ((p.quantity ?? 0) * getField(p, 'price_per_unit', 'pricePerUnit')), 0);
}

export function getCriticalProducts(products) {
  return products.filter(p => {
    const { status } = predictStockStatus(p);
    return status === 'critical' || status === 'out';
  });
}
