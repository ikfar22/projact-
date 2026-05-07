import { AlertTriangle, PackageX } from 'lucide-react';
import { getCriticalProducts, predictStockStatus } from '../utils/prediction';

export default function AlertBanner({ products }) {
  const criticalItems = getCriticalProducts(products);

  if (criticalItems.length === 0) return null;

  return (
    <div className="rounded-2xl bg-red-50/80 p-5 shadow-md shadow-red-100/50">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100/60 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-red-700">ต้องสั่งเพิ่มด่วน!</h3>
          <p className="text-sm text-red-600 mt-0.5">มี {criticalItems.length} รายการที่เสี่ยงหมดสต็อกใน 3 วัน</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {criticalItems.map(p => {
              const { daysUntilEmpty } = predictStockStatus(p);
              return (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100/60 text-xs font-semibold text-red-700"
                >
                  <PackageX size={12} />
                  {p.name} — หมดใน {Math.ceil(daysUntilEmpty)} วัน
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
