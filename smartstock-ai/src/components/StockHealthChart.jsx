import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { predictStockStatus } from '../utils/prediction';

const COLORS = {
  normal: '#10b981',   // emerald
  warning: '#f59e0b',  // amber
  critical: '#ef4444', // red
  out: '#64748b',      // slate
};

const LABELS = {
  normal: 'ปลอดภัย',
  warning: 'ควรระวัง',
  critical: 'วิกฤต',
  out: 'หมดสต็อก',
};

export default function StockHealthChart({ products }) {
  // Count by status
  const counts = { normal: 0, warning: 0, critical: 0, out: 0 };
  products.forEach(p => {
    const { status } = predictStockStatus(p);
    counts[status] = (counts[status] || 0) + 1;
  });

  const total = products.length || 1;
  const safePct = Math.round(((counts.normal) / total) * 100);
  const warningPct = Math.round(((counts.warning) / total) * 100);
  const criticalPct = Math.round(((counts.critical + counts.out) / total) * 100);

  const data = [
    { name: 'ปลอดภัย', value: counts.normal, color: COLORS.normal },
    { name: 'ควรระวัง', value: counts.warning, color: COLORS.warning },
    { name: 'วิกฤต/หมด', value: counts.critical + counts.out, color: COLORS.critical },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-1">สัดส่วนสุขภาพสต็อก</h3>
      <p className="text-sm text-slate-500 mb-6">ภาพรวมสถานะสินค้าทั้งหมด</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value) => `${value} รายการ`}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Bars */}
        <div className="flex flex-col justify-center space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                ปลอดภัย
              </span>
              <span className="text-sm font-bold text-slate-900">{safePct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${safePct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{counts.normal} รายการ</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                ควรระวัง
              </span>
              <span className="text-sm font-bold text-slate-900">{warningPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                style={{ width: `${warningPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{counts.warning} รายการ</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                วิกฤต / หมดสต็อก
              </span>
              <span className="text-sm font-bold text-slate-900">{criticalPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                style={{ width: `${criticalPct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{counts.critical + counts.out} รายการ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
