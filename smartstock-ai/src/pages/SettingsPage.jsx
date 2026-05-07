import { useState } from 'react';
import ProductForm from '../components/ProductForm';
import { predictStockStatus, getStatusColor } from '../utils/prediction';
import { Plus, Trash2, Edit3 } from 'lucide-react';

function getField(product, snake, camel) {
  return product[snake] !== undefined ? product[snake] : (product[camel] ?? 0);
}

export default function SettingsPage({ products, onUpdateProduct, onAddProduct, onDeleteProduct }) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSave = (formData) => {
    if (editingProduct) {
      onUpdateProduct(formData);
      setEditingProduct(null);
    } else {
      onAddProduct(formData);
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (confirm('ต้องการลบสินค้านี้ใช่หรือไม่?')) {
      onDeleteProduct(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">ตั้งค่าร้านค้า</h2>
          <p className="text-sm text-slate-500 mt-1">จัดการสินค้า กำหนดจุดสั่งซื้อซ้ำ และ Reorder Point</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md shadow-indigo-600/25"
        >
          <Plus size={16} />
          เพิ่มสินค้าใหม่
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}

      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">สินค้าทั้งหมด ({products.length})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {products.map(product => {
            const { status } = predictStockStatus(product);
            const colors = getStatusColor(status);
            const dailySales = getField(product, 'daily_sales', 'dailySales');
            const reorderPoint = getField(product, 'reorder_point', 'reorderPoint');
            const pricePerUnit = getField(product, 'price_per_unit', 'pricePerUnit');

            return (
              <div key={product.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/80 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คงเหลือ: {product.quantity} · ขาย/วัน: {dailySales} · จุดสั่งซื้อ: {reorderPoint} · ราคา: ฿{pricePerUnit}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${colors.bg} ${colors.text} ${colors.border}`}>
                  {colors.label}
                </span>
                <button
                  onClick={() => handleEdit(product)}
                  className="p-2 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors hover:scale-110"
                  title="แก้ไข"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors hover:scale-110"
                  title="ลบ"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
