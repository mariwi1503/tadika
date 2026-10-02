import { Link } from '@/lib/router';
import { getParentById, getParentsOfStudent } from '@/lib/storage/repositories/parents';
import { getStudentsForParent } from '@/lib/storage/repositories/students';
import { getClassById } from '@/lib/storage/repositories/classes';
import { getTeacherForClass } from '@/lib/storage/repositories/teachers';
import { getSession } from '@/lib/auth';
import { GENDER_LABELS } from '@/lib/labels';
import { ageFrom, formatDate } from '@/lib/format';
import { useStore } from '@/hooks/useStore';
import { Avatar, EmptyState, SectionCard } from '@/components/shared/elements';
import { ClipboardList, NotebookPen, Phone, UserRound } from 'lucide-react';

export default function ParentChild() {
  useStore();
  const session = getSession();
  const parent = session?.parentId ? getParentById(session.parentId) : undefined;
  const children = parent ? getStudentsForParent(parent.studentIds) : [];

  if (children.length === 0) {
    return <EmptyState icon={UserRound} title="Tiada anak berdaftar" description="Hubungi pentadbir tadika untuk pendaftaran." testId="parent-child-empty" />;
  }

  return (
    <div className="space-y-5">
      {children.map((child) => {
        const cls = getClassById(child.classId ?? '');
        const teacher = getTeacherForClass(child.classId ?? null);
        const parents = getParentsOfStudent(child.id);
        return (
          <SectionCard key={child.id} title={child.fullName} description={cls?.name ?? 'Tiada kelas'} testId={`parent-child-profile-${child.id}`}>
            <div className="flex items-center gap-4">
              <Avatar name={child.fullName} size="lg" />
              <div className="flex flex-wrap gap-2 text-sm">
                <Link to="/parent/attendance" data-testid={`parent-child-attendance-link-${child.id}`} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:border-teal-300 hover:text-teal-600">
                  <ClipboardList className="h-4 w-4" /> Kehadiran
                </Link>
                <Link to="/parent/daily-log" data-testid={`parent-child-dailylog-link-${child.id}`} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 font-medium text-slate-600 hover:border-teal-300 hover:text-teal-600">
                  <NotebookPen className="h-4 w-4" /> Rekod Harian
                </Link>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {[
                ['Tarikh Lahir', formatDate(child.dob)],
                ['Umur', ageFrom(child.dob)],
                ['Jantina', GENDER_LABELS[child.gender]],
                ['Guru Kelas', teacher?.fullName ?? '—'],
                ['Alergi', child.allergies || 'Tiada'],
                ['Keadaan Kesihatan', child.healthConditions || 'Tiada'],
                ['Nota Kesihatan', child.healthNotes || '—'],
                ['Alamat', child.address],
                ['Kontak Kecemasan', `${child.emergencyName} (${child.emergencyRelationship}) — ${child.emergencyPhone}`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-slate-400">{k}</dt>
                  <dd className="text-sm font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">Ibu Bapa / Penjaga Berdaftar</p>
              <ul className="space-y-1.5">
                {parents.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-800">{p.fullName}</span>
                    <span className="text-xs text-slate-400">
                      ({p.relationship} · {p.phone})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
