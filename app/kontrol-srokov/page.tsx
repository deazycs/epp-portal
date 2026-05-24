'use client';

import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, StatusBadge, OverdueBadge } from '@/components/ui/index';
import { MOCK_PROCUREMENTS } from '@/mock/data/procurements';
import { formatDate, formatCurrency, getDaysUntil } from '@/lib/utils';
import Link from 'next/link';

const DEADLINE_ITEMS = [
  { id: 'd1', type: 'payment', label: 'Оплата по договору', procurementId: 'p004', procurement: 'РЗ-МО-2025-00089 — Поставка бумаги', deadline: '2025-06-05', status: 'overdue', daysLeft: -5, responsible: 'Петров А.В.', sum: 85200 },
  { id: 'd2', type: 'contract', label: 'Заключение договора', procurementId: 'p008', procurement: 'РЗ-МО-2025-00134 — Мебель', deadline: '2025-06-13', status: 'critical', daysLeft: 3, responsible: 'Орлова Т.В.', sum: 408500 },
  { id: 'd3', type: 'document', label: 'Загрузка ТЗ', procurementId: 'p005', procurement: 'РЗ-МО-2025-00203 — ТО серверов', deadline: '2025-06-15', status: 'warning', daysLeft: 5, responsible: 'Никитин П.А.', sum: 650000 },
  { id: 'd4', type: 'approval', label: 'Согласование закупки', procurementId: 'p003', procurement: 'РЗ-МО-2025-00178 — Уборка помещений', deadline: '2025-06-15', status: 'warning', daysLeft: 5, responsible: 'Орлова Т.В.', sum: 340000 },
  { id: 'd5', type: 'eis', label: 'Размещение сведений в ЕИС', procurementId: 'p001', procurement: 'РЗ-МО-2025-00142 — Картриджи', deadline: '2025-06-30', status: 'ok', daysLeft: 20, responsible: 'Петров А.В.', sum: 143200 },
  { id: 'd6', type: 'execution', label: 'Исполнение договора', procurementId: 'p001', procurement: 'РЗ-МО-2025-00142 — Картриджи', deadline: '2025-06-30', status: 'ok', daysLeft: 20, responsible: 'Петров А.В.', sum: 143200 },
  { id: 'd7', type: 'payment', label: 'Оплата по договору', procurementId: 'p010', procurement: 'РЗ-МО-2025-00181 — Лифты', deadline: '2025-07-31', status: 'ok', daysLeft: 51, responsible: 'Петров А.В.', sum: 185000 },
  { id: 'd8', type: 'approval', label: 'Согласование', procurementId: 'p010', procurement: 'РЗ-МО-2025-00181 — Лифты', deadline: '2025-06-20', status: 'warning', daysLeft: 10, responsible: 'Орлова Т.В.', sum: 185000 },
];

const TYPE_LABELS: Record<string, string> = {
  payment: 'Оплата', contract: 'Договор', document: 'Документ',
  approval: 'Согласование', eis: 'ЕИС', execution: 'Исполнение',
};
const TYPE_COLORS: Record<string, string> = {
  payment: 'bg-green-50 text-green-700 border-green-300',
  contract: 'bg-blue-50 text-blue-700 border-blue-300',
  document: 'bg-purple-50 text-purple-700 border-purple-300',
  approval: 'bg-orange-50 text-orange-700 border-orange-300',
  eis: 'bg-indigo-50 text-indigo-700 border-indigo-300',
  execution: 'bg-teal-50 text-teal-700 border-teal-300',
};

export default function KontrolSrokovPage() {
  const overdue = DEADLINE_ITEMS.filter(d => d.status === 'overdue');
  const critical = DEADLINE_ITEMS.filter(d => d.status === 'critical');
  const warning = DEADLINE_ITEMS.filter(d => d.status === 'warning');
  const ok = DEADLINE_ITEMS.filter(d => d.status === 'ok');

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Контроль сроков' }]} />
        <h1 className="text-base font-bold mb-3">Контроль сроков исполнения</h1>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Просрочено', val: overdue.length, cls: 'text-red-600 bg-red-50 border-red-200', icon: '🔴' },
            { label: 'Критично (≤5 дней)', val: critical.length, cls: 'text-orange-600 bg-orange-50 border-orange-200', icon: '🟠' },
            { label: 'Внимание (≤10 дней)', val: warning.length, cls: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '🟡' },
            { label: 'В норме', val: ok.length, cls: 'text-green-600 bg-green-50 border-green-200', icon: '🟢' },
          ].map(s => (
            <div key={s.label} className={`p-2 text-center border rounded ${s.cls}`}>
              <div className="text-lg mb-0.5">{s.icon}</div>
              <div className="text-xl font-bold">{s.val}</div>
              <div className="text-xs opacity-70">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Просроченные */}
        {overdue.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <h2 className="text-sm font-bold text-red-700">Просроченные ({overdue.length})</h2>
            </div>
            <div className="space-y-1.5">
              {overdue.map(d => (
                <div key={d.id} className="gov-card p-2.5 border-l-4 border-l-red-500 bg-red-50">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`gov-badge ${TYPE_COLORS[d.type]}`}>{TYPE_LABELS[d.type]}</span>
                        <span className="text-xs font-bold text-red-700">ПРОСРОЧЕНО на {Math.abs(d.daysLeft)} дн.</span>
                      </div>
                      <div className="text-xs font-bold text-gray-800">{d.procurement}</div>
                      <div className="text-xs text-gray-500">{d.label} · Срок: {formatDate(d.deadline)} · {d.responsible}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700">{formatCurrency(d.sum)}</span>
                      <Link href={`/zakupki/${d.procurementId}`} className="gov-btn gov-btn-danger gov-btn-sm">Перейти</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Критичные */}
        {critical.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <h2 className="text-sm font-bold text-orange-700">Критично — менее 5 дней ({critical.length})</h2>
            </div>
            <div className="space-y-1.5">
              {critical.map(d => (
                <div key={d.id} className="gov-card p-2.5 border-l-4 border-l-orange-400 bg-orange-50">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`gov-badge ${TYPE_COLORS[d.type]}`}>{TYPE_LABELS[d.type]}</span>
                        <span className="text-xs font-bold text-orange-700">Осталось {d.daysLeft} дн.</span>
                      </div>
                      <div className="text-xs font-bold text-gray-800">{d.procurement}</div>
                      <div className="text-xs text-gray-500">{d.label} · Срок: {formatDate(d.deadline)} · {d.responsible}</div>
                    </div>
                    <Link href={`/zakupki/${d.procurementId}`} className="gov-btn gov-btn-ghost gov-btn-sm">Перейти →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Предупреждения */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <h2 className="text-sm font-bold text-yellow-700">Требуют внимания ({warning.length})</h2>
          </div>
          <div className="gov-card overflow-hidden">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Тип</th>
                  <th>Закупка</th>
                  <th>Контрольное событие</th>
                  <th>Срок</th>
                  <th>Осталось</th>
                  <th>Ответственный</th>
                  <th>Сумма</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...warning, ...ok].map(d => (
                  <tr key={d.id}>
                    <td><span className={`gov-badge ${TYPE_COLORS[d.type]}`}>{TYPE_LABELS[d.type]}</span></td>
                    <td className="text-xs">{d.procurement}</td>
                    <td className="text-xs font-bold">{d.label}</td>
                    <td className="text-xs">{formatDate(d.deadline)}</td>
                    <td>
                      <span className={`text-xs font-bold ${
                        d.daysLeft <= 5 ? 'text-orange-600' : d.daysLeft <= 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {d.daysLeft > 0 ? `${d.daysLeft} дн.` : 'Сегодня'}
                      </span>
                    </td>
                    <td className="text-xs">{d.responsible}</td>
                    <td className="text-xs text-right font-bold">{formatCurrency(d.sum)}</td>
                    <td>
                      <Link href={`/zakupki/${d.procurementId}`} className="gov-btn gov-btn-ghost gov-btn-sm py-0 text-xs">→</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
