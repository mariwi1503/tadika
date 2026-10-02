import { useState } from 'react';
import type { Invoice, Payment } from '@/types';
import { getParentById } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getInvoicesForStudent } from '@/lib/storage/repositories/invoices';
import { getPaymentsForInvoice } from '@/lib/storage/repositories/payments';
import { getSession } from '@/lib/auth';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_TONES } from '@/lib/labels';
import { formatDate, formatDateShort, formatRM } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatCard, StatusPill } from '@/components/shared/elements';
import { PaymentFlow } from '@/components/billing/PaymentFlow';
import { ReceiptCard } from '@/components/billing/Receipt';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Receipt, Wallet } from 'lucide-react';

export default function ParentBilling() {
  useStore();
  const session = getSession();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];
  const invoices = children
    .flatMap((c) => getInvoicesForStudent(c.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [receiptView, setReceiptView] = useState<{ invoice: Invoice; payment: Payment } | null>(null);

  const childName = (id: string) => children.find((c) => c.id === id)?.fullName ?? '—';
  const due = invoices.filter((i) => i.status === 'belum_dibayar' || i.status === 'tertunggak');
  const paid = invoices.filter((i) => i.status === 'sudah_dibayar');

  if (invoices.length === 0) {
    return (
      <div>
        <PageHeader title="Yuran & Bayaran" />
        <EmptyState icon={Receipt} title="Tiada bil buat masa ini" description="Bil yuran akan dipaparkan di sini apabila dijana oleh pentadbir." testId="parent-billing-empty" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Yuran & Bayaran" description="Bil yuran dan sejarah pembayaran." />

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Wallet} label="Baki Perlu Dibayar" value={formatRM(due.reduce((a, i) => a + i.amount, 0))} hint={`${due.length} bil`} tone={due.length > 0 ? 'warning' : 'success'} testId="parent-billing-balance" />
        <StatCard icon={Receipt} label="Sudah Dibayar" value={formatRM(paid.reduce((a, i) => a + i.amount, 0))} hint={`${paid.length} bil`} tone="success" testId="parent-billing-paid" />
      </div>

      <ul className="space-y-3" data-testid="parent-billing-list">
        {invoices.map((i) => (
          <li key={i.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid={`parent-invoice-card-${i.id}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">
                    {i.title} · {i.periodLabel}
                  </p>
                  <StatusPill label={INVOICE_STATUS_LABELS[i.status]} tone={INVOICE_STATUS_TONES[i.status]} testId={`parent-invoice-status-${i.id}`} />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {i.number} · {childName(i.studentId)} · Tarikh akhir {formatDateShort(i.dueDate)}
                </p>
                <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">{formatRM(i.amount)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {(i.status === 'belum_dibayar' || i.status === 'tertunggak') && (
                  <Button onClick={() => setPayInvoice(i)} data-testid={`parent-billing-pay-${i.id}`}>
                    <Wallet className="h-4 w-4" /> Bayar Sekarang
                  </Button>
                )}
                {i.status === 'sudah_dibayar' &&
                  (() => {
                    const pay = getPaymentsForInvoice(i.id)[0];
                    return pay ? (
                      <Button variant="outline" onClick={() => setReceiptView({ invoice: i, payment: pay })} data-testid={`parent-billing-receipt-${i.id}`}>
                        <Receipt className="h-4 w-4" /> Lihat Resit
                      </Button>
                    ) : null;
                  })()}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {payInvoice && (
        <PaymentFlow
          invoice={payInvoice}
          studentName={childName(payInvoice.studentId)}
          payerName={parent?.fullName ?? 'Ibu Bapa'}
          open
          onOpenChange={(o) => !o && setPayInvoice(null)}
        />
      )}

      {receiptView && (
        <Dialog open onOpenChange={(o) => !o && setReceiptView(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" data-testid="parent-receipt-dialog">
            <DialogTitle>Resit Bayaran</DialogTitle>
            <ReceiptCard
              payment={receiptView.payment}
              invoice={receiptView.invoice}
              studentName={childName(receiptView.invoice.studentId)}
              payerName={parent?.fullName ?? 'Ibu Bapa'}
            />
          </DialogContent>
        </Dialog>
      )}

      <p className="pb-2 text-center text-xs text-slate-400">
        Tarikh akhir bayaran setiap bulan: 15 haribulan · Pertanyaan: {formatDate(new Date().toISOString())}
      </p>
    </div>
  );
}
