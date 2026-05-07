import { useState } from 'react';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function SaleForm({ products, onRecordSale }) {
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successName, setSuccessName] = useState('');

  const [saving, setSaving] = useState(false);

  const selectedProduct = products.find(p => p.id === Number(selectedId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId || quantity <= 0) return;

    setSaving(true);
    const result = await onRecordSale(Number(selectedId), quantity);
    setSaving(false);

    if (result) {
      setSuccessName(selectedProduct.name);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setQuantity(1);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">บันทึกการขายด่วน</h2>
            <p className="text-sm text-slate-500">ตัดสต็อกและอัปเดต Burn Rate แบบ Real-time</p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-100/60 text-emerald-700 text-sm font-medium">
            <CheckCircle2 size={16} />
            บันทึกขาย "{successName}" เรียบร้อยแล้ว
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">เลือกสินค้า</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm bg-white transition-all outline-none"
              required
            >
              <option value="">-- เลือกสินค้า --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (คงเหลือ: {p.quantity})</option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-4 rounded-xl bg-slate-50/80 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">คงเหลือ</span>
                <span className="font-bold text-slate-900">{selectedProduct.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ราคาต่อหน่วย</span>
                <span className="font-bold text-slate-900">฿{(selectedProduct.price_per_unit ?? selectedProduct.pricePerUnit ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">คาดการณ์หมดใน</span>
                <span className="font-bold text-slate-900">
                  {(selectedProduct.daily_sales ?? selectedProduct.dailySales ?? 0) > 0
                    ? `${Math.ceil(selectedProduct.quantity / (selectedProduct.daily_sales ?? selectedProduct.dailySales))} วัน`
                    : 'ไม่มีการขาย'}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">จำนวนที่ขาย</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={selectedProduct?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-center text-lg font-bold transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedId || saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการขาย'}
          </button>
        </form>
      </div>
    </div>
  );
}
