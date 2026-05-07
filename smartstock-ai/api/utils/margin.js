/**
 * Margin Analysis — คำนวณกำไรขั้นต้นและระบุ Hero Product
 */

function calculateMargin(product) {
  const price = product.price_per_unit || 0;
  const cost = product.cost_per_unit || 0;
  const dailySales = product.daily_sales || 0;

  const profitPerUnit = price - cost;
  const marginPct = price > 0 ? (profitPerUnit / price) * 100 : 0;
  const dailyProfit = profitPerUnit * dailySales;
  const monthlyRevenue = price * dailySales * 30;

  // Hero Product: margin >= 30% AND daily_sales >= 3
  const isHero = marginPct >= 30 && dailySales >= 3;

  return {
    profitPerUnit: parseFloat(profitPerUnit.toFixed(2)),
    marginPct: parseFloat(marginPct.toFixed(1)),
    dailyProfit: parseFloat(dailyProfit.toFixed(2)),
    monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
    isHero,
  };
}

function getMarginColor(marginPct) {
  if (marginPct >= 40) return { text: 'text-emerald-600', bg: 'bg-emerald-500', bar: '#10b981' };
  if (marginPct >= 20) return { text: 'text-amber-600', bg: 'bg-amber-500', bar: '#f59e0b' };
  return { text: 'text-red-600', bg: 'bg-red-500', bar: '#ef4444' };
}

module.exports = { calculateMargin, getMarginColor };
