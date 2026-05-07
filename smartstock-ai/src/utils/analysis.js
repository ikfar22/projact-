export function getABCGroupConfig(group) {
  switch (group) {
    case 'A':
      return {
        label: 'กลุ่ม A',
        desc: 'ขายดี/มูลค่าสูง',
        bg: 'bg-amber-100/60',
        text: 'text-amber-700',
        dot: 'bg-amber-400',
        barColor: '#f59e0b',
        icon: '🥇',
      };
    case 'B':
      return {
        label: 'กลุ่ม B',
        desc: 'ปกติ',
        bg: 'bg-blue-100/60',
        text: 'text-blue-700',
        dot: 'bg-blue-400',
        barColor: '#3b82f6',
        icon: '🥈',
      };
    case 'C':
      return {
        label: 'กลุ่ม C',
        desc: 'ขายช้า/ค้างสต็อก',
        bg: 'bg-slate-100/60',
        text: 'text-slate-600',
        dot: 'bg-slate-400',
        barColor: '#94a3b8',
        icon: '⚠️',
      };
    default:
      return {
        label: '-',
        desc: '',
        bg: 'bg-slate-100/60',
        text: 'text-slate-500',
        dot: 'bg-slate-300',
        barColor: '#cbd5e1',
        icon: '',
      };
  }
}

export function getActionLabel(action) {
  switch (action) {
    case 'add': return { label: 'เพิ่มสินค้า', color: 'text-emerald-700', bg: 'bg-emerald-100/60', icon: '➕' };
    case 'edit': return { label: 'แก้ไขสินค้า', color: 'text-amber-700', bg: 'bg-amber-100/60', icon: '✏️' };
    case 'sale': return { label: 'บันทึกขาย', color: 'text-blue-700', bg: 'bg-blue-100/60', icon: '💰' };
    case 'delete': return { label: 'ลบสินค้า', color: 'text-red-700', bg: 'bg-red-100/60', icon: '🗑️' };
    case 'transfer': return { label: 'ย้ายโซน', color: 'text-violet-700', bg: 'bg-violet-100/60', icon: '🔄' };
    case 'reconciliation': return { label: 'ตรวจนับ', color: 'text-cyan-700', bg: 'bg-cyan-100/60', icon: '📋' };
    default: return { label: action, color: 'text-slate-700', bg: 'bg-slate-100/60', icon: '📌' };
  }
}

export function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr + 'Z');
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} วันที่แล้ว`;
}
