import { useEffect, useRef, useState } from 'react';
import type { Invoice, Payment, PaymentMethod } from '@/types';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PAYMENT_METHOD_LABELS } from '@/lib/labels';
import { formatDate, formatRM, nextSeqNumber } from '@/lib/format';
import { createPayment, getPayments } from '@/lib/storage/repositories/payments';
import { updateInvoice } from '@/lib/storage/repositories/invoices';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { ReceiptCard } from './Receipt';
import { Check, CreditCard, Landmark, Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const METHODS: { value: PaymentMethod; icon: typeof CreditCard; hint: string }[] = [
  { value: 'kad', icon: CreditCard, hint: 'Visa / Mastercard / Debit' },
  { value: 'pindahan', icon: Landmark, hint: 'Online Banking — Maybank2u, CIMB Clicks, dll.' },
  { value: 'ewallet', icon: Wallet, hint: 'DuitNow QR, TnG eWallet, GrabPay' },
];

type Step = 'kaedah' | 'memproses' | 'resit';

export function PaymentFlow({
  invoice,
  studentName,
  payerName,
  open,
  onOpenChange,
}: {
  invoice: Invoice;
  studentName: string;
  payerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<Step>('kaedah');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setStep('kaedah');
      setMethod(null);
      setReceipt(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const pay = () => {
    if (!method) return;
    setStep('memproses');
    timer.current = window.setTimeout(() => {
      const receiptNumber = nextSeqNumber(getPayments().map((p) => p.receiptNumber), 'RCP');
      const payment = createPayment({
        receiptNumber,
        invoiceId: invoice.id,
        studentId: invoice.studentId,
        payerName,
        amount: invoice.amount,
        method,
        paidAt: new Date().toISOString(),
      });
      updateInvoice(invoice.id, { status: 'sudah_dibayar' });
      logActivity(payerName, 'PARENT', 'Membuat bayaran', `${formatRM(invoice.amount)} — ${invoice.title} ${invoice.periodLabel}`);
      notifyRoles(['ADMIN'], 'Bayaran diterima', `${payerName} telah membuat bayaran ${invoice.title} ${invoice.periodLabel} sebanyak ${formatRM(invoice.amount)}.`);
      setReceipt(payment);
      setStep('resit');
      toast.success('Bayaran berjaya');
    }, 1800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" data-testid="payment-flow-dialog">
        {step === 'kaedah' && (
          <div className="space-y-5">
            <DialogTitle>Semak & Bayar</DialogTitle>
            <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4" data-testid="payment-invoice-summary">
              <p className="text-xs text-teal-700">{invoice.title} · {invoice.periodLabel}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-teal-700" data-testid="payment-amount">
                {formatRM(invoice.amount)}
              </p>
              <p className="mt-1 text-xs text-teal-600/80">
                {studentName} · Tarikh akhir: {formatDate(invoice.dueDate)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Pilih Kaedah Bayaran</p>
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  data-testid={`payment-method-${m.value}`}
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    method === m.value
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  )}
                >
                  <m.icon className={cn('h-5 w-5', method === m.value ? 'text-teal-600' : 'text-slate-400')} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-slate-900">{PAYMENT_METHOD_LABELS[m.value]}</span>
                    <span className="block text-xs text-slate-500">{m.hint}</span>
                  </span>
                  {method === m.value && <Check className="h-4 w-4 text-teal-600" />}
                </button>
              ))}
            </div>
            <Button className="w-full" size="lg" disabled={!method} onClick={pay} data-testid="payment-continue-button">
              Teruskan Bayaran
            </Button>
          </div>
        )}

        {step === 'memproses' && (
          <div className="flex flex-col items-center py-10 text-center" data-testid="payment-processing">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            <p className="mt-4 font-semibold text-slate-900">Memproses bayaran...</p>
            <p className="mt-1 text-sm text-slate-500">Sila jangan tutup tetingkap ini.</p>
          </div>
        )}

        {step === 'resit' && receipt && (
          <div className="space-y-4">
            <DialogTitle>Bayaran Berjaya</DialogTitle>
            <ReceiptCard payment={receipt} invoice={invoice} studentName={studentName} payerName={payerName} />
            <Button variant="outline" className="w-full no-print" onClick={() => onOpenChange(false)} data-testid="payment-done-button">
              Selesai
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
