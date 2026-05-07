import { useState } from 'react';
import { ClipboardCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REASONS = [
  { value: 'damaged', label: 'สินค้าชำรุด' },
  { value: 'lost', label: 'สูญหาย' },
  { value: 'overcount', label: 'นับเกิน' },
  { value: 'received', label: 'รับของเพิ่ม' },
  { value: 'other', label: 'อื่นๆ' },
];

export default function ReconciliationPage({ products, onReconcile }) {
  // actualQuantity per product: { [id]: number }
  const [actualQuantities, setActualQuantities] = useState({});
  const [reasons, setReasons] = useState({});
  const [notes, setNotes] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Update actual quantity for a product
  const updateActual = (id, value) => {
    setActualQuantities(prev => ({ ...prev, [id]: value === '' ? '' : Number(value) }));
  };

  const updateReason = (id, value) => {
    setReasons(prev => ({ ...prev, [id]: value }));
  };

  const updateNote = (id, value) => {
    setNotes(prev => ({ ...prev, [id]: value }));
  };

  // Calculate variance items (only those with changes)
  const varianceItems = products
    .filter(p => {
      const actual = actualQuantities[p.id];
      return actual !== undefined && actual !== '' && actual !== p.quantity;
    })
    .map(p => ({
      id: p.id,
      name: p.name,
      old_quantity: p.quantity,
      new_quantity: actualQuantities[p.id],
      variance: actualQuantities[p.id] - p.quantity,
      reason: reasons[p.id] || 'other',
      note: notes[p.id] || '',
    }));

  const totalVariance = varianceItems.reduce((s, v) => s + v.variance, 0);
  const missingItems = varianceItems.filter(v => v.variance < 0).length;
  const extraItems = varianceItems.filter(v => v.variance > 0).length;

  const handleSubmit = async () => {
    setSubmitting(true);
    await onReconcile(varianceItems);
    setSubmitting(false);
    setSuccess(true);
    setShowSummary(false);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">ตรวจนับสต็อก (Stock Reconciliation)</h2>
        <p className="text-sm text-slate-500 mt-1">กรอกจำนวนจริง ระบบจะคำนวณส่วนต่างและบันทึกประวัติ</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-100/60 text-emerald-700 text-sm font-medium">
          <CheckCircle2 size={16} />
          บันทึกการตรวจนับสต็อกเรียบร้อยแล้ว
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">รายการตรวจนับ</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">สินค้า</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">โซน</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">ระบบ</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">จำนวนจริง</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">ส่วนต่าง</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">เหตุผล</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const actual = actualQuantities[p.id];
                const hasInput = actual !== undefined && actual !== '';
                const variance = hasInput ? actual - p.quantity : 0;
                const isDiff = hasInput && variance !== 0;

                return (
                  <tr key={p.id} className={isDiff ? 'bg-amber-50/30' : ''}>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-slate-900">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-500">
                      {p.location || 'โซน A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-slate-700">{p.quantity.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={actual !== undefined ? actual : ''}
                        onChange={(e) => updateActual(p.id, e.target.value)}
                        placeholder={p.quantity.toString()}
                        className="w-24 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm text-right font-bold outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isDiff ? (
                        <span className={`text-sm font-bold ${variance > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {variance > 0 ? '+' : ''}{variance}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isDiff && (
                        <select
                          value={reasons[p.id] || ''}
                          onChange={(e) => updateReason(p.id, e.target.value)}
                          className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-indigo-400"
                        >
                          <option value="">เลือกเหตุผล...</option>
                          {REASONS.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary & Submit */}
      {varianceItems.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              สรุปส่วนต่าง ({varianceItems.length} รายการ)
            </h3>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showSummary ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
            </button>
          </div>

          {showSummary && (
            <div className="mb-4 space-y-2">
              {varianceItems.map(v => (
                <div key={v.id} className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-50/80 text-sm">
                  <span className="font-medium text-slate-900">{v.name}</span>
                  <span className="text-slate-500">{v.old_quantity} → {v.new_quantity}</span>
                  <span className={`font-bold ${v.variance > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {v.variance > 0 ? '+' : ''}{v.variance}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {REASONS.find(r => r.value === v.reason)?.label || ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80">
            <div className="flex gap-6 text-sm">
              <span className="text-slate-600">ส่วนต่างรวม: <span className={`font-bold text-lg ${totalVariance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{totalVariance > 0 ? '+' : ''}{totalVariance}</span></span>
              <span className="text-red-600">ขาด: {missingItems} รายการ</span>
              <span className="text-emerald-600">เกิน: {extraItems} รายการ</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:scale-[1.02] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25"
            >
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันตรวจนับ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
