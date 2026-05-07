import { useState } from 'react';
import InventoryTable from '../components/InventoryTable';
import ProductForm from '../components/ProductForm';
import TransferModal from '../components/TransferModal';
import { Plus } from 'lucide-react';

export default function InventoryPage({ products, onUpdateProduct, onAddProduct, onTransferProduct }) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [transferProduct, setTransferProduct] = useState(null);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleTransfer = (product) => {
    setTransferProduct(product);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">จัดการสต็อก</h2>
          <p className="text-sm text-slate-500 mt-1">ตารางสินค้าพร้อม AI คำนวณวันหมดสต็อก</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all shadow-md shadow-indigo-600/25"
        >
          <Plus size={16} />
          เพิ่มสินค้า
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}

      <InventoryTable products={products} onEdit={handleEdit} onTransfer={handleTransfer} />

      {transferProduct && (
        <TransferModal
          product={transferProduct}
          currentZone={transferProduct.location || 'โซน A'}
          onTransfer={(id, to_location) => onTransferProduct(id, to_location)}
          onClose={() => setTransferProduct(null)}
        />
      )}
    </div>
  );
}
