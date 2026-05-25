'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, KPICard } from '@/components/ui/index';
import {
  ANALYTICS_MONTHLY, ANALYTICS_BY_STATUS,
  ANALYTICS_BY_DEPARTMENT
} from '@/mock/data/other';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, BarChart3, PieChart as PieIcon, Download } from 'lucide-react';

const COLORS = ['#003087','#1890ff','#52c41a','#faad14','#ff4d4f','#722ed1','#13c2c2'];

const SUPPLIER_DATA = [
  { name: 'ООО ТехноОфис', contracts: 3, sum: 551700 },
  { name: 'ООО СитиКомп', contracts: 2, sum: 1190600 },
  { name: 'ООО МоскваСофт', contracts: 1, sum: 315000 },
  { name: 'ЗАО КанцЛайф', contracts: 2, sum: 135000 },
  { name: 'ИП Козлов Р.И.', contracts: 1, sum: 185000 },
];

export default function AnalitikaPage() {
  const { procurements } = useAppStore();
  const total = procurements.reduce((s,p) => s+p.plannedSum, 0);
  const contracted = procurements.reduce((s,p) => s+(p.contractSum??0), 0);
  const paid = procurements.reduce((s,p) => s+(p.paidSum??0), 0);
  const completed = procurements.filter(p => p.status === 'archive').length;
  const economy = total - contracted;
  const economyPct = total > 0 ? (economy / total * 100) : 0;

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Аналитика' }]} />
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-bold">Аналитика закупочной деятельности</h1>
            <p className="text-xs text-gray-500">Период: 2025 год · Обновлено: {new Date().toLocaleDateString('ru-RU')}</p>
          </div>
          <div className="flex gap-2">
            <select className="gov-select w-36">
              <option>2025 год</option>
              <option>2024 год</option>
              <option>I кв. 2025</option>
              <option>II кв. 2025</option>
            </select>
            <button className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={12} /> Выгрузить</button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <KPICard title="Плановый бюджет" value={formatCurrency(total)} icon={<BarChart3 size={14} />} colorClass="text-gray-700" bgClass="bg-gray-100" />
          <KPICard title="Заключено договоров" value={formatCurrency(contracted)} change={`Экономия ${Math.round((1-contracted/total)*100)}%`} changeType="up" icon={<TrendingUp size={14} />} colorClass="text-blue-700" bgClass="bg-blue-50" />
          <KPICard title="Оплачено" value={formatCurrency(paid)} icon={<TrendingUp size={14} />} colorClass="text-green-700" bgClass="bg-green-50" />
          <KPICard title="Завершено закупок" value={`${completed} из ${procurements.length}`} icon={<PieIcon size={14} />} colorClass="text-purple-700" bgClass="bg-purple-50" />
        </div>

        {/* Графики row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="gov-card">
            <div className="gov-section-title">Динамика закупок по месяцам (руб.)</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ANALYTICS_MONTHLY}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="sum" fill="#003087" name="Плановая сумма" radius={[2,2,0,0]} />
                  <Bar dataKey="completed" fill="#52c41a" name="Завершено (шт.)" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-section-title">Распределение по статусам</div>
            <div className="p-3 flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={ANALYTICS_BY_STATUS} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value">
                    {ANALYTICS_BY_STATUS.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {ANALYTICS_BY_STATUS.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Графики row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="gov-card">
            <div className="gov-section-title">Закупки по подразделениям</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ANALYTICS_BY_DEPARTMENT} layout="vertical" margin={{ left: 30 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}к`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11 }} />
                  <Bar dataKey="sum" fill="#1890ff" name="Сумма" radius={[0,2,2,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-section-title">Топ поставщиков по сумме договоров</div>
            <div className="p-3">
              <table className="gov-table">
                <thead>
                  <tr><th>Поставщик</th><th className="text-center">Договоров</th><th className="text-right">Сумма</th></tr>
                </thead>
                <tbody>
                  {SUPPLIER_DATA.map((s, i) => (
                    <tr key={s.name}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: COLORS[i] }}>
                            {i+1}
                          </span>
                          <span className="text-xs">{s.name}</span>
                        </div>
                      </td>
                      <td className="text-center text-xs font-bold">{s.contracts}</td>
                      <td className="text-right text-xs font-bold text-blue-700">{formatCurrency(s.sum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Тренд */}
        <div className="gov-card">
          <div className="gov-section-title">Тренд количества закупок (2025)</div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ANALYTICS_MONTHLY}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="count" stroke="#003087" strokeWidth={2} dot={{ r: 3 }} name="Создано закупок" />
                <Line type="monotone" dataKey="completed" stroke="#52c41a" strokeWidth={2} dot={{ r: 3 }} name="Завершено" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
