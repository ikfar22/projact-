import { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';

const ZONES = ['โซน A', 'โซน B', 'โซน C', 'โซน D'];

export default function TransferModal({ product, currentZone, onTransfer, onClose }) {
  const [targetZone, setTargetZone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetZone || targetZone === currentZone) return;

    setLoading(true);
    await onTransfer(product.id, targetZone);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">ย้ายโซนสินค้า</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm">
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="text-slate-500 mt-0.5">คงเหลือ: {product.quantity} ชิ้น · โซนปัจจุบัน: <span className="font-bold text-indigo-600">{currentZone || 'โซน A'}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ย้ายไปโซน</label>
              <div className="grid grid-cols-2 gap-2">
                {ZONES.map(zone => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setTargetZone(zone)}
                    disabled={zone === currentZone}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      targetZone === zone
                        ? 'border-blue-300 bg-blue-100/60 text-blue-700 ring-2 ring-blue-100'
                        : zone === currentZone
                          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {zone} {zone === currentZone && '(ปัจจุบัน)'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!targetZone || targetZone === currentZone || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25"
            >
              {loading ? 'กำลังย้าย...' : 'ยืนยันย้ายโซน'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
