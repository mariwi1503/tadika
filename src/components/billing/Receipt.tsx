import type { Invoice, Payment } from '@/types';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import { formatDate, formatRM, formatTime } from '@/lib/format';
import { getSettings } from '@/lib/storage/repositories/settings';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

export function ReceiptCard({
  payment,
  invoice,
  studentName,
  payerName,
}: {
  payment: Payment;
  invoice: Invoice;
  studentName: string;
  payerName: string;
}) {
  const settings = getSettings();

  const print = () => window.print();

  const download = () => {
    const rows: [string, string][] = [
      ['Nombor Resit', payment.receiptNumber],
      ['Nombor Bil', invoice.number],
      ['Nama Murid', studentName],
      ['Nama Ibu Bapa / Penjaga', payerName],
      ['Jenis Yuran', `${invoice.title} (${invoice.periodLabel})`],
      ['Jumlah', formatRM(payment.amount)],
      ['Tarikh', formatDate(payment.paidAt)],
      ['Masa', formatTime(payment.paidAt)],
      ['Kaedah Bayaran', PAYMENT_METHOD_LABELS[payment.method]],
      ['Status', 'LULUS / BERJAYA'],
    ];
    const html = `<!doctype html><html lang="ms"><head><meta charset="utf-8"><title>Resit ${payment.receiptNumber}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}h1{font-size:20px;margin:0 0 4px}p.sub{color:#64748b;margin:0 0 16px;font-size:13px}table{border-collapse:collapse;width:100%;max-width:560px}td,th{border:1px solid #e2e8f0;padding:8px 12px;text-align:left;font-size:14px}th{width:45%;background:#f8fafc}</style></head><body><h1>Resit Bayaran — ${settings.nurseryName}</h1><p class="sub">${settings.address}</p><table>${rows
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join('')}</table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resit-${payment.receiptNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resit dimuat turun');
  };

  return (
    <div className="space-y-4">
      <div className="print-area rounded-2xl border border-slate-200 bg-white p-5" data-testid="receipt-card">
        <div className="flex items-start justify-between gap-3 border-b border-dashed border-slate-200 pb-4">
          <div>
            <p className="font-bold tracking-tight text-slate-900">Resit Bayaran</p>
            <p className="text-xs text-slate-500">
              {settings.nurseryName} · {settings.phone}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> LULUS / BERJAYA
          </span>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          {[
            ['Nombor Resit', payment.receiptNumber],
            ['Nombor Bil', invoice.number],
            ['Nama Murid', studentName],
            ['Ibu Bapa / Penjaga', payerName],
            ['Jenis Yuran', `${invoice.title} (${invoice.periodLabel})`],
            ['Tarikh', `${formatDate(payment.paidAt)} · ${formatTime(payment.paidAt)}`],
            ['Kaedah Bayaran', PAYMENT_METHOD_LABELS[payment.method]],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">{k}</dt>
              <dd className="text-right font-medium text-slate-900">{v}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 border-t border-dashed border-slate-200 pt-3">
            <dt className="font-semibold text-slate-900">Jumlah Dibayar</dt>
            <dd className="text-lg font-bold text-emerald-600">{formatRM(payment.amount)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Resit ini dijana secara elektronik dan adalah bukti pembayaran yang sah.
        </p>
      </div>
      <div className="flex gap-2 no-print">
        <Button variant="outline" className="flex-1" onClick={print} data-testid="receipt-print-button">
          <Printer className="h-4 w-4" /> Cetak Resit
        </Button>
        <Button variant="outline" className="flex-1" onClick={download} data-testid="receipt-download-button">
          <Download className="h-4 w-4" /> Muat Turun
        </Button>
      </div>
    </div>
  );
}
