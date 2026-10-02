import { useState } from 'react';
import type { Parent } from '@/types';
import { createParent, deleteParent, getParents, updateParent } from '@/lib/storage/repositories/parents';
import { getStudents } from '@/lib/storage/repositories/students';
import { getInvoices } from '@/lib/storage/repositories/invoices';
import { logActivity } from '@/lib/storage/repositories/activityLogs';
import { getSession } from '@/lib/auth';
import { useStore } from '@/hooks/useStore';
import { EmptyState, PageHeader, StatusPill } from '@/components/shared/elements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Plus, Trash2, UsersRound } from 'lucide-react';
import { toast } from 'sonner';

export default function Parents() {
  useStore();
  const parents = getParents();
  const students = getStudents();
  const invoices = getInvoices();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Parent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Parent | null>(null);

  const childrenOf = (p: Parent) => p.studentIds.map((id) => students.find((s) => s.id === id)?.fullName).filter(Boolean) as string[];
  const hasArrears = (p: Parent) =>
    p.studentIds.some((sid) => invoices.some((i) => i.studentId === sid && i.status === 'tertunggak'));

  return (
    <div>
      <PageHeader
        description={`${parents.length} ibu bapa / penjaga berdaftar`}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            data-testid="parents-add-button"
          >
            <Plus className="h-4 w-4" /> Tambah Ibu Bapa
          </Button>
        }
      />

      {parents.length === 0 ? (
        <EmptyState icon={UsersRound} title="Tiada ibu bapa berdaftar" description="Tambahkan ibu bapa atau penjaga pertama." testId="parents-empty" />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]" data-testid="parents-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Hubungan</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Anak</TableHead>
                <TableHead>Status Bayaran</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parents.map((p) => (
                <TableRow key={p.id} data-testid={`parents-row-${p.id}`}>
                  <TableCell>
                    <span className="block text-sm font-semibold text-slate-900">{p.fullName}</span>
                    <span className="block text-xs text-slate-400">{p.email}</span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{p.relationship}</TableCell>
                  <TableCell className="text-sm text-slate-600">{p.phone}</TableCell>
                  <TableCell className="max-w-48 text-sm text-slate-600">
                    {childrenOf(p).length > 0 ? childrenOf(p).join(', ') : '—'}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      label={hasArrears(p) ? 'Ada tunggakan' : 'Tiada tunggakan'}
                      tone={hasArrears(p) ? 'danger' : 'success'}
                      testId={`parents-payment-status-${p.id}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon-sm" data-testid={`parents-actions-${p.id}`} aria-label="Tindakan">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                          data-testid={`parents-edit-${p.id}`}
                        >
                          <Pencil className="h-4 w-4" /> Kemaskini
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)} data-testid={`parents-delete-${p.id}`}>
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

      {formOpen && (
        <ParentForm
          key={editing?.id ?? 'new'}
          parent={editing}
          students={students.map((s) => ({ id: s.id, name: s.fullName }))}
          onClose={() => setFormOpen(false)}
        />
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm" data-testid="parents-delete-dialog">
          <DialogTitle>Padam ibu bapa?</DialogTitle>
          <p className="text-sm text-slate-500">{deleteTarget?.fullName} akan dipadam daripada sistem.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} data-testid="parents-delete-cancel">
              Batal
            </Button>
            <Button
              variant="destructive"
              data-testid="parents-delete-confirm"
              onClick={() => {
                if (!deleteTarget) return;
                const session = getSession();
                deleteParent(deleteTarget.id);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Memadam ibu bapa', deleteTarget.fullName);
                toast.success('Ibu bapa dipadam');
                setDeleteTarget(null);
              }}
            >
              Padam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ParentForm({
  parent,
  students,
  onClose,
}: {
  parent: Parent | null;
  students: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(parent?.fullName ?? '');
  const [relationship, setRelationship] = useState(parent?.relationship ?? 'Ibu');
  const [phone, setPhone] = useState(parent?.phone ?? '');
  const [email, setEmail] = useState(parent?.email ?? '');
  const [address, setAddress] = useState(parent?.address ?? '');
  const [childIds, setChildIds] = useState<string[]>(parent?.studentIds ?? []);

  const toggleChild = (id: string) => {
    setChildIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md" data-testid="parents-form-dialog">
        <DialogTitle>{parent ? 'Kemaskini Ibu Bapa' : 'Tambah Ibu Bapa'}</DialogTitle>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-name">Nama</Label>
              <Input id="pf-name" value={fullName} onChange={(e) => setFullName(e.target.value)} data-testid="parents-form-name" />
            </div>
            <div className="space-y-1.5">
              <Label>Hubungan</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger data-testid="parents-form-relationship">
                  <SelectValue>{relationship}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {['Ibu', 'Bapa', 'Penjaga'].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-phone">Telefon</Label>
              <Input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="parents-form-phone" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-email">Email</Label>
              <Input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="parents-form-email" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-address">Alamat</Label>
            <Input id="pf-address" value={address} onChange={(e) => setAddress(e.target.value)} data-testid="parents-form-address" />
          </div>
          <div className="space-y-1.5">
            <Label>Anak</Label>
            <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 p-3">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={childIds.includes(s.id)}
                    onChange={() => toggleChild(s.id)}
                    data-testid={`parents-form-child-${s.id}`}
                    className="h-4 w-4 accent-teal-600"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="parents-form-cancel">
            Batal
          </Button>
          <Button
            data-testid="parents-form-save"
            onClick={() => {
              if (!fullName.trim()) {
                toast.error('Nama diperlukan');
                return;
              }
              const session = getSession();
              const data = {
                fullName: fullName.trim(),
                relationship,
                phone: phone.trim(),
                email: email.trim(),
                address: address.trim(),
                studentIds: childIds,
              };
              if (parent) {
                updateParent(parent.id, data);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Mengemaskini ibu bapa', fullName);
                toast.success('Maklumat ibu bapa dikemaskini');
              } else {
                createParent(data);
                logActivity(session?.name ?? 'Pentadbir', 'ADMIN', 'Menambah ibu bapa', fullName);
                toast.success('Ibu bapa ditambah');
              }
              onClose();
            }}
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
