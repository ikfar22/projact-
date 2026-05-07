import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function getField(product, snake, camel) {
  return product[snake] !== undefined ? product[snake] : (product[camel] ?? 0);
}

export default function ProductForm({ product, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    daily_sales: 1,
    reorder_point: 10,
    price_per_unit: 0,
    location: 'โซน A',
    cost_per_unit: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        quantity: product.quantity,
        daily_sales: getField(product, 'daily_sales', 'dailySales'),
        reorder_point: getField(product, 'reorder_point', 'reorderPoint'),
        price_per_unit: getField(product, 'price_per_unit', 'pricePerUnit'),
        location: product.location || 'โซน A',
        cost_per_unit: getField(product, 'cost_per_unit', 'costPerUnit'),
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    if (!product) {
      setFormData({ name: '', quantity: 0, daily_sales: 1, reorder_point: 10, price_per_unit: 0 });
    }
  };

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          {product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h3>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อสินค้า</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">จำนวนคงเหลือ</label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => update('quantity', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">ราคาต่อหน่วย (บาท)</label>
          <input
            type="number"
            min="0"
            value={formData.price_per_unit}
            onChange={(e) => update('price_per_unit', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">ต้นทุนต่อหน่วย (บาท)</label>
          <input
            type="number"
            min="0"
            value={formData.cost_per_unit}
            onChange={(e) => update('cost_per_unit', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">โซน/ตำแหน่ง</label>
          <select
            value={formData.location}
            onChange={(e) => update('location', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
          >
            <option value="โซน A">โซน A</option>
            <option value="โซน B">โซน B</option>
            <option value="โซน C">โซน C</option>
            <option value="โซน D">โซน D</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">ขายเฉลี่ย/วัน</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={formData.daily_sales}
            onChange={(e) => update('daily_sales', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">จุดสั่งซื้อซ้ำ</label>
          <input
            type="number"
            min="0"
            value={formData.reorder_point}
            onChange={(e) => update('reorder_point', Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all"
            required
          />
        </div>

        <div className="sm:col-span-2 flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md shadow-indigo-600/25"
          >
            {product ? 'บันทึกแก้ไข' : 'เพิ่มสินค้า'}
          </button>
          {!product && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              ปิด
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
