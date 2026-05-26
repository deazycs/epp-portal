'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, KPICard, StatusBadge, RiskBadge } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, truncate } from '@/lib/utils';
import { MOCK_RISKS } from '@/mock/data/other';
import { MOCK_USERS } from '@/mock/data/users';
import { TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const WORKLOAD = [
  { name: 'Швецов К.Е.', active: 5, overdue: 1, completed: 12 },
  { name: 'Митусов С.А.', active: 3, overdue: 0, completed: 8 },
  { name: 'Давыдова Ф.А.', active: 4, overdue: 0, completed: 15 },
];

const DEPT_ANALYTICS = [
  { name: 'Отдел МТО', count: 18, sum: 1240000 },
  { name: 'ИТ-отдел', count: 12, sum: 2180000 },
  { name: 'Отдел общего обеспечения', count: 10, sum: 680000 },
];

const COLORS = ['#003087', '#1890ff', '#52c41a'];

export const dynamic = 'force-dynamic';
export default function RukovoditelPage() {
  const { procurements, tasks, notifications } = useAppStore();
  const active = procurements.filter(p => !['archive','cancelled'].includes(p.status));
  const overdue = procurements.filter(p => p.isOverdue);
  const highRisks = MOCK_RISKS.filter(r => r.status === 'open' && (r.level === 'high' || r.level === 'critical'));
  const totalBudget = procurements.reduce((s, p) => s + p.plannedSum, 0);

  return (
    <AppLayout>
      <div className="p-4 fade-in">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Панель руководителя' }]} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-bold">Панель руководителя</h1>
            <p className="text-xs text-gray-500">Толоконников Ю.В. · Заместитель руководителя по обеспечению</p>
          </div>
          <div className="flex gap-2">
            <Link href="/otchetnost" className="gov-btn gov-btn-secondary gov-btn-sm">Отчётность</Link>
            <Link href="/analitika" className="gov-btn gov-btn-primary gov-btn-sm">Аналитика</Link>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <KPICard title="Активных закупок" value={active.length} icon={<TrendingUp size={14} />}
            colorClass="text-blue-700" bgClass="bg-blue-50" change="+3 за неделю" changeType="up" />
          <KPICard title="Просрочено" value={overdue.length} icon={<AlertTriangle size={14} />}
            colorClass="text-red-600" bgClass="bg-red-50" />
          <KPICard title="Высоких рисков" value={highRisks.length} icon={<AlertTriangle size={14} />}
            colorClass="text-orange-600" bgClass="bg-orange-50" />
          <KPICard title="Бюджет 2025" value={formatCurrency(totalBudget)} icon={<CheckCircle size={14} />}
            colorClass="text-gray-700" bgClass="bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Нагрузка сотрудников */}
          <div className="gov-card">
            <div className="gov-section-title">👥 Нагрузка специалистов МТО</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={WORKLOAD}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="active" fill="#1890ff" name="Активные" radius={[2,2,0,0]} />
                  <Bar dataKey="overdue" fill="#ff4d4f" name="Просрочены" radius={[2,2,0,0]} />
                  <Bar dataKey="completed" fill="#52c41a" name="Завершены" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* По подразделениям */}
          <div className="gov-card">
            <div className="gov-section-title">🏢 Закупки по подразделениям</div>
            <div className="p-3 flex items-center gap-4">
              <ResponsiveContainer width="45%" height={160}>
                <PieChart>
                  <Pie data={DEPT_ANALYTICS} cx="50%" cy="50%" outerRadius={65} dataKey="sum">
                    {DEPT_ANALYTICS.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1">
                <table className="gov-table">
                  <tbody>
                    {DEPT_ANALYTICS.map((d, i) => (
                      <tr key={d.name}>
                        <td>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }} />
                            <span className="text-xs">{d.name}</span>
                          </div>
                        </td>
                        <td className="text-xs font-bold text-center">{d.count}</td>
                        <td className="text-xs font-bold text-right text-blue-700">{formatCurrency(d.sum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Проблемные закупки */}
        <div className="gov-card mb-4">
          <div className="gov-section-title flex items-center justify-between">
            <span>⚠️ Проблемные закупки (требуют решения руководителя)</span>
            <Link href="/zakupki" className="text-xs text-blue-600 hover:underline normal-case font-normal">Все →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr><th>№ Реестра</th><th>Наименование</th><th>Статус</th><th>Риск</th><th>Проблема</th><th>Ответственный</th></tr>
              </thead>
              <tbody>
                {procurements.filter(p => p.isOverdue || p.riskLevel === 'high').map(p => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/zakupki/${p.id}`} className="text-blue-600 hover:underline font-bold text-xs">
                        {p.registryNumber}
                      </Link>
                    </td>
                    <td className="text-xs">{truncate(p.title, 40)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td><RiskBadge level={p.riskLevel} /></td>
                    <td className="text-xs text-red-600 font-bold">
                      {p.isOverdue ? `Просрочка ${p.overduedays ?? ''}дн.` : 'Высокий риск'}
                    </td>
                    <td className="text-xs font-bold">{p.responsibleName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Онлайн сотрудники */}
        <div className="gov-card">
          <div className="gov-section-title">🟢 Сотрудники на рабочем месте</div>
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MOCK_USERS.filter(u => u.id).map(u => (
              <div key={u.id} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                  {u.nameShort.split(' ').map(p => p[0]).join('').slice(0,2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold leading-tight truncate">{u.nameShort}</div>
                  <div className="text-xs text-gray-400 leading-tight truncate">{u.position}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
