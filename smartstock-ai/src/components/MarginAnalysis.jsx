import { TrendingUp, Star, DollarSign, Trophy } from 'lucide-react';

function getField(product, snake, camel) {
  return product[snake] !== undefined ? product[snake] : (product[camel] ?? 0);
}

function getMarginBarStyle(marginPct) {
  if (marginPct >= 40) return { color: '#10b981', label: 'text-emerald-700' };
  if (marginPct >= 20) return { color: '#f59e0b', label: 'text-amber-700' };
  return { color: '#ef4444', label: 'text-red-700' };
}

export default function MarginAnalysis({ products }) {
  // Calculate margin for each product
  const withMargin = products.map(p => {
    const price = getField(p, 'price_per_unit', 'pricePerUnit');
    const cost = getField(p, 'cost_per_unit', 'costPerUnit');
    const dailySales = getField(p, 'daily_sales', 'dailySales');
    const profitPerUnit = price - cost;
    const marginPct = price > 0 ? ((profitPerUnit / price) * 100) : 0;
    const dailyProfit = profitPerUnit * dailySales;
    return {
      ...p,
      marginPct: parseFloat(marginPct.toFixed(1)),
      profitPerUnit: parseFloat(profitPerUnit.toFixed(2)),
      dailyProfit: parseFloat(dailyProfit.toFixed(2)),
    };
  });

  // Hero products: margin >= 30% AND daily_sales >= 3
  const heroes = withMargin.filter(p => {
    const dailySales = getField(p, 'daily_sales', 'dailySales');
    return p.marginPct >= 30 && dailySales >= 3;
  });

  // Top 5 by daily profit
  const topByProfit = [...withMargin].sort((a, b) => b.dailyProfit - a.dailyProfit).slice(0, 5);

  // Average margin
  const avgMargin = withMargin.length > 0
    ? (withMargin.reduce((s, p) => s + p.marginPct, 0) / withMargin.length).toFixed(1)
    : 0;

  // Total daily profit
  const totalDailyProfit = withMargin.reduce((s, p) => s + p.dailyProfit, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={20} className="text-amber-600" />
            <p className="text-sm font-medium text-amber-800">Hero Products</p>
          </div>
          <p className="text-3xl font-bold text-amber-900">{heroes.length}</p>
          <p className="text-xs text-amber-700 mt-1">กำไรดี + ขายเร็ว</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">Margin เฉลี่ย</p>
          </div>
          <p className="text-3xl font-bold text-emerald-900">{avgMargin}%</p>
          <p className="text-xs text-emerald-700 mt-1">อัตรากำไรขั้นต้น</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} className="text-indigo-600" />
            <p className="text-sm font-medium text-indigo-800">กำไร/วัน (รวม)</p>
          </div>
          <p className="text-3xl font-bold text-indigo-900">฿{totalDailyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-indigo-700 mt-1">ประมาณการกำไรต่อวัน</p>
        </div>
      </div>

      {/* Top 5 by Profit */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900">Top 5 ทำกำไรสูงสุด/วัน</h3>
        </div>

        <div className="space-y-3">
          {topByProfit.map((p, i) => {
            const dailySales = getField(p, 'daily_sales', 'dailySales');
            const isHero = p.marginPct >= 30 && dailySales >= 3;
            const barStyle = getMarginBarStyle(p.marginPct);

            return (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <span className="text-lg font-bold text-slate-400 w-6 text-center">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">{p.name}</span>
                    {isHero && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100/60 text-amber-700 font-semibold">
                        HERO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>ราคา: ฿{getField(p, 'price_per_unit', 'pricePerUnit').toLocaleString()}</span>
                    <span>ต้นทุน: ฿{getField(p, 'cost_per_unit', 'costPerUnit').toLocaleString()}</span>
                    <span>กำไร/ชิ้น: ฿{p.profitPerUnit.toLocaleString()}</span>
                    <span>ขาย/วัน: {dailySales}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-slate-900">฿{p.dailyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${p.marginPct >= 40 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : p.marginPct >= 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
                        style={{ width: `${Math.min(100, p.marginPct)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${barStyle.label}`}>{p.marginPct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
