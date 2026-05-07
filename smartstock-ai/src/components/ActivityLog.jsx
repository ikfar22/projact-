import { getActionLabel, formatTimeAgo } from '../utils/analysis';

export default function ActivityLog({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">กิจกรรมล่าสุด</h3>
        <p className="text-sm text-slate-500">ยังไม่มีกิจกรรม</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-1">กิจกรรมล่าสุด</h3>
      <p className="text-sm text-slate-500 mb-4">ประวัติการแก้ไขสต็อก</p>

      <div className="space-y-3">
        {logs.slice(0, 15).map(log => {
          const actionInfo = getActionLabel(log.action);
          const qtyChange = log.quantity_change || 0;
          const isNegative = qtyChange < 0;

          return (
            <div
              key={log.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-lg ${actionInfo.bg} flex items-center justify-center flex-shrink-0 text-sm`}>
                {actionInfo.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${actionInfo.bg} ${actionInfo.color}`}>
                    {actionInfo.label}
                  </span>
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {log.inventory_name || 'สินค้าที่ถูกลบ'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>โดย <span className="font-medium text-slate-700">{log.username || 'ไม่ทราบ'}</span></span>
                  <span>·</span>
                  <span>{formatTimeAgo(log.created_at)}</span>
                  {log.quantity_change !== 0 && (
                    <>
                      <span>·</span>
                      <span className={`font-bold ${isNegative ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isNegative ? '' : '+'}{log.quantity_change}
                      </span>
                    </>
                  )}
                </div>
                {log.note && (
                  <p className="text-xs text-slate-400 mt-1">{log.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
