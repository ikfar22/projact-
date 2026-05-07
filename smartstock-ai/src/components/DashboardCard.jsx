import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function DashboardCard({ title, value, subtitle, icon: Icon, color = 'indigo', alert }) {
  const colorMap = {
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/20',
    red: 'from-red-500 to-red-600 shadow-red-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
  };

  const iconColorMap = {
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
    red: 'from-red-50 to-red-100 text-red-600',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
    amber: 'from-amber-50 to-amber-100 text-amber-600',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-md shadow-slate-200/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${colorMap[color]} rounded-bl-full opacity-[0.07]`} />
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium font-['Prompt']">{title}</p>
            <p className="text-3xl font-bold mt-2 text-slate-900 tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm mt-1 text-slate-400">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${iconColorMap[color]}`}>
            <Icon size={22} />
          </div>
        </div>
        {alert && (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600">
            <TrendingUp size={14} />
            {alert}
          </div>
        )}
      </div>
    </div>
  );
}
