import SaleForm from '../components/SaleForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalePage({ products, onRecordSale, salesLog }) {
  // API returns: { id, inventory_id, quantity, sale_date, product_name }
  const recentSales = [...salesLog]
    .sort((a, b) => new Date(b.sale_date || b.date) - new Date(a.sale_date || a.date))
    .slice(0, 10)
    .map(entry => ({
      ...entry,
      productName: entry.product_name || products.find(p => p.id === (entry.inventory_id || entry.productId))?.name || 'ไม่ทราบสินค้า',
    }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">บันทึกการขาย</h2>
        <p className="text-sm text-slate-500 mt-1">ตัดสต็อกและอัปเดตข้อมูลแบบ Real-time</p>
      </div>

      <SaleForm products={products} onRecordSale={onRecordSale} />

      {recentSales.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">ประวัติการขายล่าสุด</h3>
          <p className="text-sm text-slate-500 mb-4">{recentSales.length} รายการล่าสุด</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentSales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="productName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => v?.slice(0, 10) + '...'}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#0f172a',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="quantity" fill="#818cf8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
