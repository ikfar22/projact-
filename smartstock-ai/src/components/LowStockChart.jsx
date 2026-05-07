import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LowStockChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-1">แนวโน้มสินค้าใกล้หมดสต็อก</h3>
      <p className="text-sm text-slate-500 mb-6">จำนวนสินค้าที่มีสต็อกต่ำกว่าจุดสั่งซื้อซ้ำ (ย้อนหลัง 7 วัน)</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                color: '#0f172a',
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            />
            <Area
              type="monotone"
              dataKey="สินค้าใกล้หมด"
              stroke="#ef4444"
              strokeWidth={2.5}
              fill="url(#colorLow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
