import { useState } from 'react';
import type { Invoice, InvoiceStatus, Payment } from '@/types';
import { createInvoice, deleteInvoice, getInvoices, updateInvoice } from '@/lib/storage/repositories/invoices';
import { getStudents } from '@/lib/storage/repositories/students';
import { getParents } from '@/lib/storage/repositories/parents';
import { getPaymentsForInvoice } from '@/lib/storage/repositories/payments';
import { notifyRoles } from '@/lib/storage/repositories/notifications';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_TONES, PAYMENT_METHOD_LABELS } from '@/lib/labels';
import { formatDate, formatDateShort, formatRM, monthLabel, nextSeqNumber } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatCard, StatusPill } from '@/components/shared/elements';
import { PaymentFlow } from '@/components/billing/PaymentFlow';
import { ReceiptCard } from '@/components/billing/Receipt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal, Plus, Receipt, Search, Trash2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const now = new Date();

function monthOptions(): { label: string; value: string; due: string }[] {
  const out: { label: string; value: string; due: string }[] = [];
  for (let off = -1; off <= 2; off++) {
    const d = new Date(now.getFullYear(), now.getMonth() + off, 1);
    const label = monthLabel(d.getFullYear(), d.getMonth());
    const due = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-15`;
    out.push({ label, value: label, due });
  }
  return out;
}

export default function Billing() {
  useStore();
  const invoices = getInvoices();
  const students = getStudents();
  const parents = getParents();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [detail, setDetail] = useState<Invoice | null>(null);
  const [receiptView, setReceiptView] = useState<{ invoice: Invoice; payment: Payment } | null>(null);

  const studentName = (id: string) => students.find((s) => s.id === id)?.fullName ?? '—';
  const payerOf = (studentId: string) => parents.find((p) => p.studentIds.includes(studentId))?.fullName ?? 'Ibu Bapa';

  const countBy = (st: InvoiceStatus) => invoices.filter((i) => i.status === st).length;
  const sumBy = (...sts: InvoiceStatus[]) => invoices.filter((i) => sts.includes(i.status)).reduce((a, i) => a + i.amount, 0);

  const filtered = invoices
    .filter((i) => (statusFilter === 'semua' ? true : i.status === statusFilter))
    .filter((i) => (search.trim() ? studentName(i.studentId).toLowerCase().includes(search.trim().toLowerCase()) || i.number.toLowerCase().includes(search.trim().toLowerCase()) : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader
        description="Urus bil yuran, pembayaran dan tunggakan."
        action={
          <Button onClick={() => setGenerateOpen(true)} data-testid="billing-generate-button">
            <Plus className="h-4 w-4" /> Jana Bil Bulanan
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <StatCard icon={Receipt} label="Jumlah Bil" value={invoices.length} hint={formatRM(invoices.reduce((a, i) => a + i.amount, 0))} testId="billing-stat-total" />
        <StatCard icon={Receipt} label="Sudah Dibayar" value={formatRM(sumBy('sudah_dibayar'))} hint={`${countBy('sudah_dibayar')} bil`} tone="success" testId="billing-stat-paid" />
        <StatCard icon={Receipt} label="Belum Dibayar" value={formatRM(sumBy('belum_dibayar'))} hint={`${countBy('belum_dibayar')} bil`} tone="warning" testId="billing-stat-unpaid" />
        <StatCard icon={Receipt} label="Tertunggak" value={formatRM(sumBy('tertunggak'))} hint={`${countBy('tertunggak')} bil`} tone="danger" testId="billing-stat-overdue" />
      </div>

      <div className="my-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nombor bil atau nama murid..." className="pl-9" data-testid="billing-search-input" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48" data-testid="billing-status-filter">
            <SelectValue>{(v: string) => (v === 'semua' ? 'Semua Status' : INVOICE_STATUS_LABELS[v as InvoiceStatus])}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            {(Object.keys(INVOICE_STATUS_LABELS) as InvoiceStatus[]).map((st) => (
              <SelectItem key={st} value={st}>
                {INVOICE_STATUS_LABELS[st]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Receipt} title="Tiada bil ditemui" description="Jana bil bulanan atau ubah penapis carian." testId="billing-empty" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="billing-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bil</TableHead>
                <TableHead>Murid</TableHead>
                <TableHead>Jenis / Tempoh</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Tarikh Akhir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((i) => (
                <TableRow key={i.id} data-testid={`billing-row-${i.id}`}>
                  <TableCell className="text-sm font-medium text-slate-900">{i.number}</TableCell>
                  <TableCell className="text-sm text-slate-600">{studentName(i.studentId)}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {i.title}
                    <span className="block text-xs text-slate-400">{i.periodLabel}</span>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-slate-900">{formatRM(i.amount)}</TableCell>
                  <TableCell className="text-sm text-slate-600">{formatDateShort(i.dueDate)}</TableCell>
                  <TableCell>
                    <StatusPill label={INVOICE_STATUS_LABELS[i.status]} tone={INVOICE_STATUS_TONES[i.status]} testId={`billing-status-${i.id}`} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" data-testid={`billing-actions-${i.id}`} aria-label="Tindakan" />}>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDetail(i)} data-testid={`billing-view-${i.id}`}>
                          <Eye className="h-4 w-4" /> Lihat Bil
                        </DropdownMenuItem>
                        {(i.status === 'belum_dibayar' || i.status === 'tertunggak') && (
                          <DropdownMenuItem onClick={() => setPayInvoice(i)} data-testid={`billing-pay-${i.id}`}>
                            <Wallet className="h-4 w-4" /> Bayar (Simulasi)
                          </DropdownMenuItem>
                        )}
                        {i.status === 'sudah_dibayar' &&
                          (() => {
                            const pay = getPaymentsForInvoice(i.id)[0];
                            return pay ? (
                              <DropdownMenuItem onClick={() => setReceiptView({ invoice: i, payment: pay })} data-testid={`billing-receipt-${i.id}`}>
                                <Receipt className="h-4 w-4" /> Lihat Resit
                              </DropdownMenuItem>
                            ) : null;
                          })()}
                        {i.status === 'draf' && (
                          <DropdownMenuItem
                            onClick={() => {
                              updateInvoice(i.id, { status: 'belum_dibayar' });
                              notifyRoles(['PARENT'], 'Yuran bulan ini kini tersedia', `${i.title} ${i.periodLabel} sebanyak ${formatRM(i.amount)} kini boleh dibayar.`);
                              logActivity(getSession()?.name ?? 'Pentadbir', 'ADMIN', 'Mengaktifkan bil', `${i.number} — ${studentName(i.studentId)}`);
                              toast.success('Bil dihantar kepada ibu bapa');
                            }}
                            data-testid={`billing-activate-${i.id}`}
                          >
                            Hantar Bil
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem variant="destructive" onClick={() => { deleteInvoice(i.id); toast.success('Bil dipadam'); }} data-testid={`billing-delete-${i.id}`}>
                          <Trash2 className="h-4 w-4" /> Padam
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {generateOpen && <GenerateDialog onClose={() => setGenerateOpen(false)} />}

      {payInvoice && (
        <PaymentFlow
          invoice={payInvoice}
          studentName={studentName(payInvoice.studentId)}
          payerName={payerOf(payInvoice.studentId)}
          open
          onOpenChange={(o) => !o && setPayInvoice(null)}
        />
      )}

      {detail && (
        <Dialog open onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="sm:max-w-md" data-testid="billing-detail-dialog">
            <DialogTitle>Butiran Bil</DialogTitle>
            <dl className="space-y-2 text-sm">
              {[
                ['Nombor Bil', detail.number],
                ['Murid', studentName(detail.studentId)],
                ['Ibu Bapa / Penjaga', payerOf(detail.studentId)],
                ['Jenis Yuran', `${detail.title} (${detail.periodLabel})`],
                ['Jumlah', formatRM(detail.amount)],
                ['Tarikh Akhir', formatDate(detail.dueDate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-slate-900">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-2">
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <StatusPill label={INVOICE_STATUS_LABELS[detail.status]} tone={INVOICE_STATUS_TONES[detail.status]} />
                </dd>
              </div>
            </dl>
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Sejarah Pembayaran</p>
              {getPaymentsForInvoice(detail.id).length === 0 ? (
                <p className="text-sm text-slate-400">Belum ada pembayaran direkodkan.</p>
              ) : (
                <ul className="space-y-2">
                  {getPaymentsForInvoice(detail.id).map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm" data-testid={`billing-payment-${p.id}`}>
                      <span>
                        <span className="block font-medium text-slate-900">{p.receiptNumber}</span>
                        <span className="block text-xs text-slate-500">
                          {formatDateShort(p.paidAt)} · {PAYMENT_METHOD_LABELS[p.method]}
                        </span>
                      </span>
                      <span className="font-semibold text-emerald-600">{formatRM(p.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {receiptView && (
        <Dialog open onOpenChange={(o) => !o && setReceiptView(null)}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" data-testid="billing-receipt-dialog">
            <DialogTitle>Resit Bayaran</DialogTitle>
            <ReceiptCard
              payment={receiptView.payment}
              invoice={receiptView.invoice}
              studentName={studentName(receiptView.invoice.studentId)}
              payerName={payerOf(receiptView.invoice.studentId)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function GenerateDialog({ onClose }: { onClose: () => void }) {
  const options = monthOptions();
  const [period, setPeriod] = useState(options[1].value);
  const [title, setTitle] = useState('Yuran Bulanan');
  const [amount, setAmount] = useState('500');

  const generate = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      toast.error('Jumlah tidak sah');
      return;
    }
    const existing = getInvoices();
    const students = getStudents().filter((s) => s.status === 'approved');
    let created = 0;
    for (const s of students) {
      const exists = existing.some((i) => i.studentId === s.id && i.title === title && i.periodLabel === period);
      if (exists) continue;
      createInvoice({
        number: nextSeqNumber(getInvoices().map((i) => i.number), 'INV'),
        studentId: s.id,
        title,
        periodLabel: period,
        amount: amt,
        dueDate: options.find((o) => o.value === period)?.due ?? period,
        status: 'belum_dibayar',
        createdAt: new Date().toISOString(),
      });
      created += 1;
    }
    if (created > 0) {
      notifyRoles(['PARENT'], 'Yuran bulan ini kini tersedia', `${title} ${period} sebanyak ${formatRM(amt)} telah dijana. Sila buat pembayaran sebelum tarikh akhir.`);
      logActivity(getSession()?.name ?? 'Pentadbir', 'ADMIN', 'Menjana bil bulanan', `${title} ${period} — ${created} bil`);
      toast.success(`${created} bil dijana untuk ${period}`);
    } else {
      toast('Semua murid sudah mempunyai bil untuk tempoh ini');
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="billing-generate-dialog">
        <DialogTitle>Jana Bil Bulanan</DialogTitle>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Jenis Yuran</Label>
            <Select value={title} onValueChange={setTitle}>
              <SelectTrigger data-testid="billing-generate-type">
                <SelectValue>{title}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {['Yuran Bulanan', 'Yuran Seragam', 'Yuran Makanan'].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Bulan</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger data-testid="billing-generate-month">
                  <SelectValue>{period}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bg-amount">Jumlah (RM)</Label>
              <Input id="bg-amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="billing-generate-amount" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Bil akan dijana untuk semua murid aktif yang belum mempunyai bil jenis ini bagi bulan terpilih.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="billing-generate-cancel">
            Batal
          </Button>
          <Button onClick={generate} data-testid="billing-generate-confirm">
            Jana Bil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
