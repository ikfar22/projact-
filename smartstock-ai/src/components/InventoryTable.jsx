import { getStatusColor, predictStockStatus } from '../utils/prediction';
import { getABCGroupConfig } from '../utils/analysis';
import { Download, Printer, ArrowRightLeft } from 'lucide-react';

function getField(product, snake, camel) {
  return product[snake] !== undefined ? product[snake] : (product[camel] ?? 0);
}

// Generate restock list text for products that need ordering
function generateRestockText(products) {
  const needRestock = products
    .filter(p => (p.suggested_order_quantity ?? 0) > 0 || predictStockStatus(p).status === 'critical' || predictStockStatus(p).status === 'out' || predictStockStatus(p).status === 'warning')
    .sort((a, b) => {
      const order = { out: 0, critical: 1, warning: 2, normal: 3 };
      return (order[predictStockStatus(a).status] ?? 3) - (order[predictStockStatus(b).status] ?? 3);
    });

  if (needRestock.length === 0) {
    return 'SmartStock AI — Restock Report\n' + '='.repeat(50) + '\n\nไม่มีสินค้าที่ต้องสั่งซื้อเพิ่มเติม\n';
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('th-TH');

  let text = 'SmartStock AI — รายการสั่งซื้อสินค้าแนะนำ (Restock List)\n';
  text += '='.repeat(60) + '\n';
  text += `วันที่: ${dateStr} เวลา: ${timeStr}\n`;
  text += `จำนวนรายการ: ${needRestock.length}\n`;
  text += '='.repeat(60) + '\n\n';

  needRestock.forEach((p, i) => {
    const { status, daysUntilEmpty } = predictStockStatus(p);
    const soq = p.suggested_order_quantity ?? 0;
    const abc = p.abc_group || 'B';
    const dailySales = getField(p, 'daily_sales', 'dailySales');
    const reorderPoint = getField(p, 'reorder_point', 'reorderPoint');

    text += `${i + 1}. ${p.name}\n`;
    text += `   กลุ่ม: ${abc} | สถานะ: ${status.toUpperCase()}\n`;
    text += `   คงเหลือ: ${p.quantity} | ขาย/วัน: ${dailySales} | จุดสั่งซื้อ: ${reorderPoint}\n`;
    text += `   หมดใน: ${status === 'out' ? 'หมดแล้ว' : status === 'critical' ? `${Math.ceil(daysUntilEmpty)} วัน (วิกฤต)` : `${Math.ceil(daysUntilEmpty)} วัน`}\n`;
    text += `   >>> จำนวนที่ควรสั่งซื้อ: ${soq} ชิ้น <<<\n`;
    text += '\n';
  });

  const totalUnits = needRestock.reduce((s, p) => s + (p.suggested_order_quantity ?? 0), 0);
  text += '-'.repeat(60) + '\n';
  text += `รวมจำนวนที่ต้องสั่งซื้อทั้งหมด: ${totalUnits} ชิ้น\n`;
  text += '-'.repeat(60) + '\n';
  text += '\nสร้างโดย SmartStock AI (ระบบจัดการสต็อกอัจฉริยะ)\n';

  return text;
}

function handleExport(products) {
  const text = generateRestockText(products);
  const blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `restock-list-${dateStr}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function handlePrint(products) {
  const text = generateRestockText(products);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Restock List - SmartStock AI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 13px; margin-bottom: 20px; }
        .divider { border-top: 2px solid #333; margin: 12px 0; }
        .item { margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px dotted #ccc; }
        .item-name { font-weight: bold; font-size: 14px; }
        .item-detail { font-size: 12px; color: #555; margin-top: 2px; }
        .soq { font-weight: bold; color: #dc2626; font-size: 14px; margin-top: 4px; }
        .footer { margin-top: 20px; font-size: 11px; color: #999; text-align: center; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>SmartStock AI — รายการสั่งซื้อสินค้าแนะนำ</h1>
      <p class="subtitle">${generateRestockText(products).split('\n').slice(2, 4).join('<br>')}</p>
      <div class="divider"></div>
      ${products
        .filter(p => (p.suggested_order_quantity ?? 0) > 0 || ['critical', 'out', 'warning'].includes(predictStockStatus(p).status))
        .sort((a, b) => {
          const order = { out: 0, critical: 1, warning: 2, normal: 3 };
          return (order[predictStockStatus(a).status] ?? 3) - (order[predictStockStatus(b).status] ?? 3);
        })
        .map((p, i) => {
          const { status, daysUntilEmpty } = predictStockStatus(p);
          const soq = p.suggested_order_quantity ?? 0;
          const dailySales = getField(p, 'daily_sales', 'dailySales');
          const reorderPoint = getField(p, 'reorder_point', 'reorderPoint');
          return `
            <div class="item">
              <div class="item-name">${i + 1}. ${p.name} [${p.abc_group || 'B'}]</div>
              <div class="item-detail">คงเหลือ: ${p.quantity} | ขาย/วัน: ${dailySales} | จุดสั่งซื้อ: ${reorderPoint}</div>
              <div class="item-detail">สถานะ: ${status.toUpperCase()} | หมดใน: ${status === 'out' ? 'หมดแล้ว' : Math.ceil(daysUntilEmpty) + ' วัน'}</div>
              ${soq > 0 ? `<div class="soq">จำนวนที่ควรสั่งซื้อ: ${soq} ชิ้น</div>` : ''}
            </div>
          `;
        }).join('')}
      <p class="footer">สร้างโดย SmartStock AI — ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}

function StatusBadge({ product }) {
  const { status } = predictStockStatus(product);
  const colors = getStatusColor(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      {colors.label}
    </span>
  );
}

function ABCBadge({ group }) {
  const config = getABCGroupConfig(group);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.icon} {config.label}
    </span>
  );
}

function SOQBadge({ product }) {
  const soq = product.suggested_order_quantity ?? 0;
  if (soq <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100/60 text-indigo-700" title="จำนวนที่ควรสั่งซื้อ">
      📦 +{soq}
    </span>
  );
}

function DaysRemaining({ product }) {
  const { daysUntilEmpty, status } = predictStockStatus(product);
  const colors = getStatusColor(status);

  if (status === 'out') {
    return <span className={`text-sm font-bold ${colors.text}`}>หมดสต็อก</span>;
  }
  if (daysUntilEmpty === Infinity) {
    return <span className="text-sm text-slate-400">ไม่มีการขาย</span>;
  }

  return (
    <span className={`text-sm font-bold ${colors.text}`}>
      {Math.ceil(daysUntilEmpty)} วัน
    </span>
  );
}

export default function InventoryTable({ products, onEdit, onTransfer }) {
  const sorted = [...products].sort((a, b) => {
    const aStatus = predictStockStatus(a).status;
    const bStatus = predictStockStatus(b).status;
    const order = { out: 0, critical: 1, warning: 2, normal: 3 };
    return (order[aStatus] ?? 3) - (order[bStatus] ?? 3);
  });

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 overflow-hidden">
      <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">รายการสินค้าทั้งหมด</h3>
          <p className="text-sm text-slate-500">{products.length} รายการ · เรียงตามความเร่งด่วน</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport(products)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-100/60 hover:bg-emerald-100 transition-colors hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download size={14} />
            Export Restock
          </button>
          <button
            onClick={() => handlePrint(products)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-100/60 hover:bg-indigo-100 transition-colors hover:scale-[1.02] active:scale-[0.98]"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">สินค้า</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">ABC</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">คงเหลือ</th>
              <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">สั่งเพิ่ม</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">ขาย/วัน</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">จุดสั่งซื้อ</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">สถานะ</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">หมดใน</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">มูลค่า</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">แก้ไข</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">ย้ายโซน</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(product => {
              const { status } = predictStockStatus(product);
              const rowColors = status === 'out' || status === 'critical' ? 'bg-red-50/30' : '';
              const dailySales = getField(product, 'daily_sales', 'dailySales');
              const reorderPoint = getField(product, 'reorder_point', 'reorderPoint');
              const pricePerUnit = getField(product, 'price_per_unit', 'pricePerUnit');
              const abcGroup = product.abc_group || 'B';

              return (
                <tr key={product.id} className={`hover:bg-slate-50 transition-colors border-b border-slate-50 ${rowColors}`}>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-slate-900">{product.name}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center"><ABCBadge group={abcGroup} /></div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold ${product.quantity <= reorderPoint ? 'text-red-600' : 'text-slate-900'}`}>
                      {product.quantity.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="flex justify-center"><SOQBadge product={product} /></div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{dailySales.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right text-sm text-slate-600">{reorderPoint.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center"><StatusBadge product={product} /></div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center"><DaysRemaining product={product} /></div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-slate-700">
                    ฿{(product.quantity * pricePerUnit).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onEdit(product)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 hover:scale-[1.02]"
                    >
                      แก้ไข
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {onTransfer && (
                      <button
                        onClick={() => onTransfer(product)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50"
                        title="ย้ายโซน"
                      >
                        <ArrowRightLeft size={12} />
                        {product.location || 'โซน A'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
