import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PillTone } from '@/lib/labels';
import { initials } from '@/lib/format';

const TONE_CLASSES: Record<PillTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  brand: 'bg-teal-50 text-teal-700 border-teal-200',
};

export function StatusPill({ label, tone, testId }: { label: string; tone: PillTone; testId?: string }) {
  return (
    <span
      data-testid={testId}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  );
}

const AVATAR_COLORS = [
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
];

export function Avatar({ name, size = 'md', testId }: { name: string; size?: 'sm' | 'md' | 'lg'; testId?: string }) {
  const idx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const sizeCls = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
  return (
    <span
      data-testid={testId}
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', AVATAR_COLORS[idx], sizeCls)}
    >
      {initials(name)}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {title && <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>}
        {description && <p className={cn('text-sm text-slate-500', title && 'mt-1')}>{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function GreetingCard({
  title,
  subtitle,
  action,
  testId,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="rounded-2xl bg-teal-600 p-5 text-white shadow-[0_8px_24px_rgba(13,148,136,0.25)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold tracking-tight">{title}</p>
          {subtitle && <p className="mt-0.5 text-sm text-teal-50/90">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'brand',
  testId,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: PillTone;
  testId?: string;
}) {
  const iconTones: Record<PillTone, string> = {
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-rose-50 text-rose-600',
    info: 'bg-sky-50 text-sky-600',
    neutral: 'bg-slate-100 text-slate-600',
    brand: 'bg-teal-50 text-teal-600',
  };
  return (
    <div
      data-testid={testId}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconTones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  testId,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  testId,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      className={cn('rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)]', className)}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={cn('p-5', contentClassName)}>{children}</div>
    </div>
  );
}
