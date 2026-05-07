import { LayoutDashboard, Package, ShoppingCart, Settings, ClipboardCheck } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { id: 'inventory', label: 'จัดการสต็อก', icon: Package },
  { id: 'sale', label: 'บันทึกขาย', icon: ShoppingCart },
  { id: 'reconciliation', label: 'ตรวจสต็อก', icon: ClipboardCheck },
  { id: 'settings', label: 'ตั้งค่าร้านค้า', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, shopName }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50 shadow-xl">
      <div className="px-6 pt-8 pb-6 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-lg">S</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SmartStock AI</h1>
            <p className="text-xs text-slate-400">{shopName || 'SME Inventory'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-6 pb-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-white/60 before:rounded-r-full'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-0.5'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700/60">
        <p className="text-xs text-slate-500">v2.0.0 API Mode</p>
      </div>
    </aside>
  );
}
