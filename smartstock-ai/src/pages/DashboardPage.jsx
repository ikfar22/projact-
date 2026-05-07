import { AlertTriangle, DollarSign, TrendingDown, Package, Star, Download, Printer } from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import LowStockChart from '../components/LowStockChart';
import AlertBanner from '../components/AlertBanner';
import StockHealthChart from '../components/StockHealthChart';
import ActivityLog from '../components/ActivityLog';
import MarginAnalysis from '../components/MarginAnalysis';
import {
  calculateBurnRate,
  calculateTotalValue,
  getCriticalProducts,
  generateTrendData,
  predictStockStatus,
} from '../utils/prediction';
import { getABCGroupConfig } from '../utils/analysis';

// Export & Print helper functions (same as InventoryTable)
function getField(product, snake, camel) {
  return product[snake] !== undefined ? product[snake] : (product[camel] ?? 0);
}

function generateRestockText(products) {
  const needRestock = products
    .filter(p => (p.suggested_order_quantity ?? 0) > 0 || predictStockStatus(p).status === 'critical' || predictStockStatus(p).status === 'out' || predictStockStatus(p).status === 'warning')
    .sort((a, b) => {
      const order = { out: 0, critical: 1, warning: 2, normal: 3 };
      return (order[predictStockStatus(a).status] ?? 3) - (order[predictStockStatus(b).status] ?? 3);
    });

  if (needRestock.length === 0) return 'SmartStock AI — Restock Report\n' + '='.repeat(50) + '\n\nไม่มีสินค้าที่ต้องสั่งซื้อเพิ่มเติม\n';

  const now = new Date();
  let text = 'SmartStock AI — รายการสั่งซื้อสินค้าแนะนำ (Restock List)\n';
  text += '='.repeat(60) + '\n';
  text += `วันที่: ${now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })} เวลา: ${now.toLocaleTimeString('th-TH')}\n`;
  text += `จำนวนรายการ: ${needRestock.length}\n`;
  text += '='.repeat(60) + '\n\n';

  needRestock.forEach((p, i) => {
    const { status, daysUntilEmpty } = predictStockStatus(p);
    const soq = p.suggested_order_quantity ?? 0;
    text += `${i + 1}. ${p.name}\n`;
    text += `   กลุ่ม: ${p.abc_group || 'B'} | สถานะ: ${status.toUpperCase()}\n`;
    text += `   คงเหลือ: ${p.quantity} | ขาย/วัน: ${getField(p, 'daily_sales', 'dailySales')} | จุดสั่งซื้อ: ${getField(p, 'reorder_point', 'reorderPoint')}\n`;
    text += `   หมดใน: ${status === 'out' ? 'หมดแล้ว' : Math.ceil(daysUntilEmpty) + ' วัน'}\n`;
    text += `   >>> จำนวนที่ควรสั่งซื้อ: ${soq} ชิ้น <<<\n\n`;
  });

  const totalUnits = needRestock.reduce((s, p) => s + (p.suggested_order_quantity ?? 0), 0);
  text += '-'.repeat(60) + `\nรวมจำนวนที่ต้องสั่งซื้อทั้งหมด: ${totalUnits} ชิ้น\n` + '-'.repeat(60) + '\n\nสร้างโดย SmartStock AI (ระบบจัดการสต็อกอัจฉริยะ)\n';
  return text;
}

function handleExport(products) {
  const text = generateRestockText(products);
  const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `restock-list-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function handlePrint(products) {
  const text = generateRestockText(products);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Restock List</title>
    <style>body{font-family:'Segoe UI',Tahoma,sans-serif;padding:40px;color:#1a1a1a}h1{font-size:20px;margin-bottom:4px}.subtitle{color:#666;font-size:13px;margin-bottom:20px}.divider{border-top:2px solid #333;margin:12px 0}.item{margin-bottom:14px;padding-bottom:14px;border-bottom:1px dotted #ccc}.item-name{font-weight:bold;font-size:14px}.item-detail{font-size:12px;color:#555;margin-top:2px}.soq{font-weight:bold;color:#dc2626;font-size:14px;margin-top:4px}.footer{margin-top:20px;font-size:11px;color:#999;text-align:center}@media print{body{padding:20px}}</style></head><body>
    <h1>SmartStock AI — รายการสั่งซื้อสินค้าแนะนำ</h1>
    <p class="subtitle">${text.split('\n').slice(2, 4).join('<br>')}</p><div class="divider"></div>
    ${products.filter(p => (p.suggested_order_quantity ?? 0) > 0 || ['critical', 'out', 'warning'].includes(predictStockStatus(p).status)).sort((a, b) => ({ out: 0, critical: 1, warning: 2, normal: 3 }[predictStockStatus(a).status] ?? 3) - ({ out: 0, critical: 1, warning: 2, normal: 3 }[predictStockStatus(b).status] ?? 3)).map((p, i) => { const { status, daysUntilEmpty } = predictStockStatus(p); const soq = p.suggested_order_quantity ?? 0; return `<div class="item"><div class="item-name">${i + 1}. ${p.name} [${p.abc_group || 'B'}]</div><div class="item-detail">คงเหลือ: ${p.quantity} | ขาย/วัน: ${getField(p, 'daily_sales', 'dailySales')} | จุดสั่งซื้อ: ${getField(p, 'reorder_point', 'reorderPoint')}</div><div class="item-detail">สถานะ: ${status.toUpperCase()} | หมดใน: ${status === 'out' ? 'หมดแล้ว' : Math.ceil(daysUntilEmpty) + ' วัน'}</div>${soq > 0 ? `<div class="soq">จำนวนที่ควรสั่งซื้อ: ${soq} ชิ้น</div>` : ''}</div>`; }).join('')}
    <p class="footer">สร้างโดย SmartStock AI — ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p></body></html>`);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}

export default function DashboardPage({ products, logs }) {
  const criticalCount = getCriticalProducts(products).length;
  const burnRate = calculateBurnRate(products);
  const totalValue = calculateTotalValue(products);
  const trendData = generateTrendData(products);

  // ABC Summary counts
  const abcCounts = { A: 0, B: 0, C: 0 };
  products.forEach(p => {
    const group = p.abc_group || 'B';
    abcCounts[group]++;
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">แดชบอร์ด</h2>
        <p className="text-sm text-slate-500 mt-1">ภาพรวมสต็อกและสถานะสินค้า</p>
      </div>

      <AlertBanner products={products} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <DashboardCard
          title="สินค้าต้องสั่งด่วน"
          value={criticalCount}
          subtitle="สินค้าที่หมดใน 3 วัน"
          icon={AlertTriangle}
          color={criticalCount > 0 ? 'red' : 'emerald'}
          alert={criticalCount > 0 ? `${criticalCount} รายการต้องการความสนใจ` : undefined}
        />
        <DashboardCard
          title="มูลค่าสต็อกรวม"
          value={`฿${totalValue.toLocaleString()}`}
          subtitle="จากสินค้าทั้งหมด"
          icon={DollarSign}
          color="indigo"
        />
        <DashboardCard
          title="Burn Rate เฉลี่ย"
          value={`${burnRate.toFixed(1)} ต่อวัน`}
          subtitle="อัตราการใช้สินค้าเฉลี่ย"
          icon={TrendingDown}
          color="amber"
        />
        <DashboardCard
          title="สินค้าทั้งหมด"
          value={products.length}
          subtitle={`คงเหลือรวม ${products.reduce((s, p) => s + p.quantity, 0).toLocaleString()} หน่วย`}
          icon={Package}
          color="indigo"
        />
      </div>

      {/* ABC Summary */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900 font-['Prompt']">ABC Analysis — จัดกลุ่มสินค้าอัตโนมัติ</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['A', 'B', 'C'].map(group => {
            const config = getABCGroupConfig(group);
            return (
              <div key={group} className={`p-4 rounded-xl ${config.bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${config.text}`}>{config.label}</p>
                    <p className="text-xs text-slate-500">{config.desc}</p>
                  </div>
                </div>
                <p className={`text-3xl font-bold mt-3 ${config.text}`}>{abcCounts[group]}</p>
                <p className="text-xs text-slate-500">รายการ</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Margin Analysis */}
      <MarginAnalysis products={products} />

      <LowStockChart data={trendData} />

      {/* Stock Health Chart */}
      <StockHealthChart products={products} />

      {/* Quick Critical List */}
      {criticalCount > 0 && (
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">สินค้าวิกฤต — ต้องจัดการทันที</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport(products)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 transition-colors hover:scale-[1.02]"
              >
                <Download size={12} />
                Export Restock
              </button>
              <button
                onClick={() => handlePrint(products)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-100/60 hover:bg-indigo-100 transition-colors hover:scale-[1.02]"
              >
                <Printer size={12} />
                Print
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {getCriticalProducts(products).map(p => {
              const { daysUntilEmpty, status } = predictStockStatus(p);
              const isOut = status === 'out';
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-red-100/60"
                >
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-900 truncate">{p.name}</p>
                    <p className="text-xs text-red-600">
                      คงเหลือ {p.quantity} · {isOut ? 'หมดสต็อก' : `หมดใน ${Math.ceil(daysUntilEmpty)} วัน`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <ActivityLog logs={logs} />
    </div>
  );
}
