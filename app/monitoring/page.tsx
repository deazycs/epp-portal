'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, StatusBadge, OverdueBadge } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const OVERDUE_PAYMENTS = [
  { id: 'op1', registry: 'РЗ-МО-2026-00089', title: 'Поставка бумаги', supplier: 'ЗАО КанцЛайф', sum: 85200, dueDate: '2026-06-05', overdueDays: 5, responsible: 'Швецов К.Е.' },
];

const OVERDUE_CONTRACTS = [
  { id: 'oc1', registry: 'РЗ-МО-2026-00134', title: 'Мебель для кабинетов', supplier: 'ООО ТехноОфис', sum: 408500, dueDate: '2026-06-13', overdueDays: -3, responsible: 'Давыдова Ф.А.' },
];

export const dynamic = 'force-dynamic';
export default function MonitoringPage() {
  const { procurements } = useAppStore();
  const overdueProc = procurements.filter(p => p.isOverdue);

  return (
    <AppLayout>
      <div className="p-4 fade-in">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Мониторинг просрочек' }]} />
        <h1 className="text-base font-bold mb-1">Мониторинг просрочек</h1>
        <p className="text-xs text-gray-500 mb-4">Все просроченные сроки и нарушения</p>

        {overdueProc.length === 0 && OVERDUE_PAYMENTS.length === 0 ? (
          <div className="gov-card p-8 text-center text-green-600">
            <AlertTriangle size={28} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold">Просрочек нет!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Просроченные платежи */}
            <div>
              <h2 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle size={14} /> Просроченные платежи ({OVERDUE_PAYMENTS.length})
              </h2>
              <div className="gov-card overflow-hidden">
          <table className="gov-table">
                  <thead><tr><th>Закупка</th><th>Поставщик</th><th>Сумма</th><th>Срок оплаты</th><th>Просрочка</th><th>Ответственный</th><th></th></tr></thead>
                  <tbody>
                    {OVERDUE_PAYMENTS.map(p => (
                      <tr key={p.id} className="bg-red-50">
                        <td>
                          <div className="text-xs font-bold text-blue-600">{p.registry}</div>
                          <div className="text-xs text-gray-500">{p.title}</div>
                        </td>
                        <td className="text-xs">{p.supplier}</td>
                        <td className="text-xs font-bold">{formatCurrency(p.sum)}</td>
                        <td className="text-xs text-red-600 font-bold">{formatDate(p.dueDate)}</td>
                        <td><OverdueBadge days={p.overdueDays} /></td>
                        <td className="text-xs font-bold">{p.responsible}</td>
                        <td><Link href="/zakupki/p004" className="gov-btn gov-btn-danger gov-btn-sm py-0 text-xs">Устранить</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Просроченные закупки */}
            {overdueProc.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-orange-700 mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Просроченные закупки ({overdueProc.length})
                </h2>
                <div className="gov-card overflow-hidden">
          <table className="gov-table">
                    <thead><tr><th>Закупка</th><th>Статус</th><th>Сумма</th><th>Плановый срок</th><th>Ответственный</th><th></th></tr></thead>
                    <tbody>
                      {overdueProc.map(p => (
                        <tr key={p.id} className="bg-orange-50">
                          <td>
                            <Link href={`/zakupki/${p.id}`} className="text-blue-600 hover:underline font-bold text-xs">{p.registryNumber}</Link>
                            <div className="text-xs text-gray-500">{p.title.slice(0,35)}…</div>
                          </td>
                          <td><StatusBadge status={p.status} /></td>
                          <td className="text-xs font-bold">{formatCurrency(p.plannedSum)}</td>
                          <td className="text-xs text-red-600 font-bold">{formatDate(p.plannedEndDate)}</td>
                          <td className="text-xs font-bold">{p.responsibleName}</td>
                          <td><Link href={`/zakupki/${p.id}`} className="gov-btn gov-btn-ghost gov-btn-sm py-0 text-xs">→</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
