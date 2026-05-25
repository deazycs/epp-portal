'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS, RISK_LABELS, RISK_COLORS } from '@/mock/data/procurements';
import { AlertTriangle, Clock, CheckCircle2, Circle, Minus } from 'lucide-react';

// ============================================================
// STATUS BADGE
// ============================================================
export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={cn('gov-badge', colorClass)}>
      {label}
    </span>
  );
}

// ============================================================
// RISK BADGE
// ============================================================
export function RiskBadge({ level }: { level: string }) {
  const label = RISK_LABELS[level] ?? level;
  const colorClass = RISK_COLORS[level] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  const icon = level === 'critical' || level === 'high'
    ? <AlertTriangle size={10} className="inline mr-1" />
    : null;
  return (
    <span className={cn('gov-badge', colorClass)}>
      {icon}{label}
    </span>
  );
}

// ============================================================
// PRIORITY BADGE
// ============================================================
const PRIORITY_MAP: Record<string, { label: string; cls: string }> = {
  low: { label: 'Низкий', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  normal: { label: 'Обычный', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
  high: { label: 'Высокий', cls: 'bg-orange-50 text-orange-700 border-orange-300' },
  urgent: { label: 'Срочный', cls: 'bg-red-50 text-red-700 border-red-300' },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const { label, cls } = PRIORITY_MAP[priority] ?? PRIORITY_MAP.normal;
  return <span className={cn('gov-badge', cls)}>{label}</span>;
}

// ============================================================
// OVERDUE BADGE
// ============================================================
export function OverdueBadge({ days }: { days?: number }) {
  return (
    <span className="gov-badge bg-red-50 text-red-700 border-red-300">
      <Clock size={10} className="inline mr-1" />
      {days ? `Просрочка ${days} дн.` : 'Просрочено'}
    </span>
  );
}

// ============================================================
// TASK STATUS BADGE
// ============================================================
const TASK_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  new: { label: 'Новая', cls: 'bg-blue-50 text-blue-700 border-blue-300' },
  in_progress: { label: 'В работе', cls: 'bg-yellow-50 text-yellow-700 border-yellow-300' },
  done: { label: 'Выполнена', cls: 'bg-green-50 text-green-700 border-green-300' },
  overdue: { label: 'Просрочена', cls: 'bg-red-50 text-red-700 border-red-300' },
  cancelled: { label: 'Отменена', cls: 'bg-gray-100 text-gray-500 border-gray-300' },
};

export function TaskStatusBadge({ status }: { status: string }) {
  const { label, cls } = TASK_STATUS_MAP[status] ?? TASK_STATUS_MAP.new;
  return <span className={cn('gov-badge', cls)}>{label}</span>;
}

// ============================================================
// ONLINE DOT
// ============================================================
export function OnlineDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={cn(
      'w-2 h-2 rounded-full inline-block flex-shrink-0',
      isOnline ? 'bg-green-500' : 'bg-gray-300'
    )} />
  );
}

// ============================================================
// PROGRESS BAR
// ============================================================
export function ProgressBar({ value, max = 100, colorClass = 'bg-blue-600' }: {
  value: number;
  max?: number;
  colorClass?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="gov-progress">
      <div
        className={cn('gov-progress-bar', colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ============================================================
// WORKFLOW PROGRESS
// ============================================================
interface WFStep {
  name: string;
  isCompleted: boolean;
  isActive: boolean;
  order: number;
}

export function WorkflowProgress({ steps }: { steps: WFStep[] }) {
  const completedCount = steps.filter(s => s.isCompleted).length;
  const total = steps.length;

  return (
    <div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={step.order} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={cn(
                'workflow-step-dot',
                step.isCompleted && 'completed',
                step.isActive && !step.isCompleted && 'active',
                !step.isCompleted && !step.isActive && 'pending',
              )}>
                {step.isCompleted ? '✓' : step.order}
              </div>
              <div className="text-xs mt-0.5 text-gray-500 hidden sm:block" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                {step.name}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                'h-px w-6 mx-1 flex-shrink-0',
                step.isCompleted ? 'bg-green-400' : 'bg-gray-200'
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        Этап {completedCount + (steps.find(s => s.isActive) ? 1 : 0)} из {total}
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
export function EmptyState({ message = 'Данные не найдены', icon }: {
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {icon || <Minus size={32} className="mb-3 opacity-30" />}
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ============================================================
// LOADING SPINNER
// ============================================================
export function LoadingSpinner({ text = 'Загрузка...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12 gap-3">
      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm text-gray-500">{text}</span>
    </div>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================
export function SectionHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between mb-3', className)}>
      <div>
        <h1 className="text-base font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================
export function KPICard({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon,
  colorClass = 'text-blue-700',
  bgClass = 'bg-blue-50',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  colorClass?: string;
  bgClass?: string;
}) {
  return (
    <div className="gov-card p-3">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 leading-tight">{title}</span>
        {icon && (
          <span className={cn('w-7 h-7 rounded flex items-center justify-center flex-shrink-0', bgClass, colorClass)}>
            {icon}
          </span>
        )}
      </div>
      <div className={cn('text-2xl font-bold', colorClass)}>{value}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
      {change && (
        <div className={cn(
          'text-xs mt-1 font-bold',
          changeType === 'up' && 'text-green-600',
          changeType === 'down' && 'text-red-600',
          changeType === 'neutral' && 'text-gray-500',
        )}>
          {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'} {change}
        </div>
      )}
    </div>
  );
}

// ============================================================
// BREADCRUMBS
// ============================================================
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 mb-3">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-blue-600 hover:underline">{item.label}</a>
          ) : (
            <span className={i === items.length - 1 ? 'text-gray-700 font-bold' : ''}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ============================================================
// INFO ROW (label: value pairs)
// ============================================================
export function InfoRow({ label, value, className }: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-2 py-1 border-b border-gray-100', className)}>
      <span className="text-xs text-gray-500 w-44 flex-shrink-0">{label}:</span>
      <span className="text-xs text-gray-800 flex-1 font-medium">{value ?? '—'}</span>
    </div>
  );
}

// PageHint — описание назначения страницы (показывается вверху каждого раздела)
export function PageHint({ title, text, law }: { title: string; text: string; law?: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-xs text-blue-600 mb-3 flex items-center gap-1 hover:underline">
      <span>ℹ</span> Показать описание раздела
    </button>
  );
  return (
    <div className="gov-alert gov-alert-info mb-3 text-xs flex items-start gap-2">
      <span className="text-blue-500 text-base flex-shrink-0 mt-0.5">ℹ</span>
      <div className="flex-1">
        <span className="font-bold text-blue-800">{title}: </span>
        <span className="text-blue-700">{text}</span>
        {law && <span className="text-blue-500 ml-1 opacity-70">({law})</span>}
      </div>
      <button onClick={() => setOpen(false)} className="text-blue-400 hover:text-blue-600 flex-shrink-0 text-lg leading-none ml-1">×</button>
    </div>
  );
}
