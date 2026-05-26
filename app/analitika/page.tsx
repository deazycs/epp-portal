'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
  RadialBarChart, RadialBar, FunnelChart, Funnel, LabelList,
} from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Download, BarChart3, Clock, DollarSign, Target, Award
} from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#003087','#0050b3','#1890ff','#52c41a','#faad14','#ff4d4f','#722ed1'];

// Данные для графиков
const MONTHLY = [
  { month: 'Янв', planned: 850000, contracted: 812000, paid: 780000, count: 3, overdue: 0 },
  { month: 'Фев', planned: 1240000, contracted: 1180000, paid: 1100000, count: 5, overdue: 1 },
  { month: 'Мар', planned: 960000, contracted: 890000, paid: 860000, count: 4, overdue: 0 },
  { month: 'Апр', planned: 2100000, contracted: 1950000, paid: 1700000, count: 7, overdue: 1 },
  { month: 'Май', planned: 1580000, contracted: 1420000, paid: 950000, count: 6, overdue: 2 },
  { month: 'Июн', planned: 780000, contracted: 0, paid: 0, count: 2, overdue: 0 },
];

const BY_KBK = [
  { kbk: '...90020 244', name: 'Товары/расходники', plan: 1850000, fact: 1680000, pct: 91 },
  { kbk: '...90020 242', name: 'ИТ-оборудование', plan: 3200000, fact: 2950000, pct: 92 },
  { kbk: '...90020 243', name: 'Услуги/сервисы', plan: 1400000, fact: 1250000, pct: 89 },
  { kbk: '...90071 244', name: 'Прочие нужды',   plan: 620000,  fact: 0,       pct: 0 },
];

const BY_DEPT = [
  { name: 'МТО',      count: 4, sum: 1250000, economy: 87000,  overdue: 0, color: '#003087' },
  { name: 'ИТ-отдел',count: 3, sum: 5200000, economy: 310000, overdue: 1, color: '#1890ff' },
  { name: 'ОО',       count: 3, sum: 820000,  economy: 54000,  overdue: 0, color: '#52c41a' },
  { name: 'ОГТ',      count: 0, sum: 0,       economy: 0,      overdue: 0, color: '#9ca3af' },
];

const FUNNEL_DATA = [
  { name: 'Служебных записок', value: 10, fill: '#003087' },
  { name: 'Согласовано с ЛБО', value: 9,  fill: '#1890ff' },
  { name: 'Закупок создано',   value: 9,  fill: '#0ea5e9' },
  { name: 'Размещено на ЕАТ',  value: 9,  fill: '#52c41a' },
  { name: 'Договоров подписано',value: 9, fill: '#16a34a' },
  { name: 'Оплачено',          value: 7,  fill: '#4ade80' },
];

const TIMING = [
  { stage: 'СЗ → Согласование',   avg: 1.2, norm: 2, good: true },
  { stage: 'Согласование → ЛБО',  avg: 1.5, norm: 3, good: true },
  { stage: 'Создание → ЕАТ',       avg: 2.1, norm: 3, good: true },
  { stage: 'ЕАТ → Договор',        avg: 4.8, norm: 5, good: true },
  { stage: 'Договор → Приёмка',    avg: 32,  norm: 30, good: false },
  { stage: 'Приёмка → Оплата',     avg: 3.2, norm: 5, good: true },
];

const SPECIALISTS = [
  { name: 'Швецов К.Е.',   closed: 4, avgDays: 28, economy: 87000,  overdue: 0 },
  { name: 'Болдина А.В.',  closed: 3, avgDays: 31, economy: 54000,  overdue: 0 },
  { name: 'Щетинина Н.С.',closed: 2, avgDays: 45, economy: 12000,  overdue: 1 },
  { name: 'Рыбалка Н.С.', closed: 1, avgDays: 22, economy: 180000, overdue: 0 },
];

export default function AnalitikaPage() {
  const { procurements } = useAppStore();
  const [period, setPeriod] = useState('2026');

  const total      = procurements.reduce((s, p) => s + p.plannedSum, 0);
  const contracted = procurements.reduce((s, p) => s + (p.contractSum ?? 0), 0);
  const paid       = procurements.reduce((s, p) => s + (p.paidSum ?? 0), 0);
  const economy    = total > 0 && contracted > 0 ? total - contracted : 360000;
  const economyPct = total > 0 ? ((economy / total) * 100).toFixed(1) : '3.8';
  const overdueCount = procurements.filter(p => p.isOverdue).length;
  const active     = procurements.filter(p => !['archive','cancelled'].includes(p.status)).length;
  const archived   = procurements.filter(p => p.status === 'archive').length;

  const totalBudget   = 7510000;
  const budgetUsedPct = Math.round((contracted / totalBudget) * 100) || 68;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Аналитика' }]}/>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-base font-bold">Аналитика закупочной деятельности</h1>
            <p className="text-xs text-gray-500">
              Управление Росреестра по Воронежской области · МТО · {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
          <div className="flex gap-2">
            <select className="gov-select text-xs w-32" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="2026">2026 год</option>
              <option value="q2">II кв. 2026</option>
              <option value="q1">I кв. 2026</option>
            </select>
            <button className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={12}/> Отчёт</button>
          </div>
        </div>

        {/* ── ГЛАВНЫЕ KPI ───────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Плановый бюджет', val: formatCurrency(totalBudget), sub: `Использовано ${budgetUsedPct}%`, icon: <DollarSign size={16}/>, color: '#003087', bg: '#eff6ff', bar: budgetUsedPct },
            { label: 'Экономия бюджета', val: formatCurrency(economy), sub: `${economyPct}% от НМЦК`, icon: <TrendingDown size={16}/>, color: '#15803d', bg: '#ecfdf5', bar: null },
            { label: 'Активных закупок', val: String(active), sub: `${archived} завершено`, icon: <BarChart3 size={16}/>, color: '#0050b3', bg: '#eff6ff', bar: null },
            { label: 'Просрочек', val: String(overdueCount), sub: overdueCount > 0 ? 'Требуют внимания' : 'Всё в норме', icon: <AlertTriangle size={16}/>, color: overdueCount > 0 ? '#b91c1c' : '#15803d', bg: overdueCount > 0 ? '#fef2f2' : '#ecfdf5', bar: null },
          ].map(k => (
            <div key={k.label} className="gov-card p-3" style={{ borderTop: `3px solid ${k.color}` }}>
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs text-gray-500">{k.label}</div>
                <div style={{ color: k.color }}>{k.icon}</div>
              </div>
              <div className="text-xl font-bold leading-tight" style={{ color: k.color }}>{k.val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
              {k.bar !== null && (
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${k.bar}%`, background: k.color }}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── ВОРОНКА ИСПОЛНЕНИЯ ────────────────────────────── */}
        <div className="gov-card overflow-hidden mb-4">
          <div className="gov-section-title flex items-center gap-2">
            <Target size={13}/> Воронка исполнения — от СЗ до оплаты
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {FUNNEL_DATA.map((item, i) => {
                const pct = Math.round((item.value / FUNNEL_DATA[0].value) * 100);
                return (
                  <div key={i} className="text-center">
                    <div className="relative mx-auto mb-2" style={{ width: 56, height: 56 }}>
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke={item.fill} strokeWidth="3"
                          strokeDasharray={`${pct} 100`} strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold" style={{ color: item.fill }}>{item.value}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 leading-snug">{item.name}</div>
                    {i > 0 && (
                      <div className="text-xs font-bold mt-0.5" style={{ color: pct === 100 ? '#15803d' : '#b45309' }}>
                        {pct}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
              💡 Из 10 поданных СЗ → 9 получили финансирование (ЛБО) → 9 размещено на ЕАТ → 7 оплачено. Конверсия 70%.
            </div>
          </div>
        </div>

        {/* ── ГРАФИКИ 1 ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Динамика план/факт/оплата */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title">📈 Динамика план / факт / оплата (руб.)</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY} barGap={2}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }}/>
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}к`}/>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11 }}/>
                  <Legend wrapperStyle={{ fontSize: 10 }}/>
                  <Bar dataKey="planned"    fill="#93c5fd" name="План"    radius={[2,2,0,0]}/>
                  <Bar dataKey="contracted" fill="#003087" name="Договор" radius={[2,2,0,0]}/>
                  <Bar dataKey="paid"       fill="#4ade80" name="Оплата"  radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Исполнение бюджета по КБК */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title">💰 Исполнение бюджета по КБК</div>
            <div className="p-3">
              <div className="space-y-3">
                {BY_KBK.map(k => (
                  <div key={k.kbk}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div>
                        <span className="font-bold text-gray-800">{k.name}</span>
                        <span className="text-gray-400 ml-1 font-mono text-xs">{k.kbk}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold" style={{ color: k.pct >= 90 ? '#15803d' : k.pct > 0 ? '#b45309' : '#9ca3af' }}>
                          {k.pct}%
                        </span>
                        <span className="text-gray-400 ml-1">{formatCurrency(k.fact)} / {formatCurrency(k.plan)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${k.pct}%`, background: k.pct >= 90 ? '#15803d' : k.pct > 0 ? '#f59e0b' : '#e5e7eb' }}/>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-100">
                  <span className="text-gray-600">Итого:</span>
                  <span className="text-blue-700">
                    {formatCurrency(BY_KBK.reduce((s,k) => s+k.fact, 0))} /&nbsp;
                    {formatCurrency(BY_KBK.reduce((s,k) => s+k.plan, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ГРАФИКИ 2 ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* По подразделениям */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title">🏢 Закупки по подразделениям</div>
            <div className="p-3">
              <div className="space-y-2">
                {BY_DEPT.map(d => (
                  <div key={d.name} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: d.color }}>
                      {d.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="font-bold">{d.name}</span>
                        <span className="text-gray-500">{d.count} закупок</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-blue-700 font-medium">{d.sum > 0 ? formatCurrency(d.sum) : '—'}</span>
                        {d.economy > 0 && <span className="text-green-600">экономия {formatCurrency(d.economy)}</span>}
                        {d.overdue > 0 && <span className="text-red-600">⚠ {d.overdue} просрочка</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Скорость прохождения этапов */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title"><Clock size={13}/> Среднее время на этапах (рабочих дней)</div>
            <div className="p-3">
              <div className="space-y-2">
                {TIMING.map(t => (
                  <div key={t.stage} className="flex items-center gap-2">
                    <div className="text-xs text-gray-600 w-40 flex-shrink-0 leading-snug">{t.stage}</div>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                        style={{ width: `${Math.min((t.avg / t.norm) * 70, 100)}%`, background: t.good ? '#15803d' : '#dc2626' }}>
                        <span className="text-white text-xs font-bold">{t.avg}</span>
                      </div>
                    </div>
                    <div className="text-xs w-14 flex-shrink-0 text-right">
                      <span style={{ color: t.good ? '#15803d' : '#dc2626' }}>{t.good ? '✓' : '⚠'} </span>
                      <span className="text-gray-400">норма {t.norm}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ПРОСРОЧКИ И СПЕЦИАЛИСТЫ ───────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Динамика просрочек */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title">⚠ Просрочки по месяцам</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={MONTHLY}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }}/>
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false}/>
                  <Tooltip contentStyle={{ fontSize: 11 }}/>
                  <Area type="monotone" dataKey="overdue" stroke="#dc2626" fill="#fef2f2"
                    strokeWidth={2} name="Просрочек"/>
                  <Area type="monotone" dataKey="count" stroke="#003087" fill="#eff6ff"
                    strokeWidth={2} name="Всего закупок"/>
                </AreaChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Май: 2 просрочки из 6 закупок — требуется внимание
              </div>
            </div>
          </div>

          {/* Рейтинг специалистов */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title"><Award size={13}/> Эффективность специалистов МТО</div>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Специалист</th>
                      <th className="text-center">Закрыто</th>
                      <th className="text-center">Ср. дней</th>
                      <th className="text-right">Экономия</th>
                      <th className="text-center">Просрочки</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SPECIALISTS.sort((a,b) => a.avgDays - b.avgDays).map((s, i) => (
                      <tr key={s.name} className={i === 0 ? 'bg-green-50' : ''}>
                        <td>
                          <div className="flex items-center gap-1.5">
                            {i === 0 && <span className="text-yellow-500 text-xs">🏆</span>}
                            <span className="text-xs font-medium">{s.name}</span>
                          </div>
                        </td>
                        <td className="text-center text-xs font-bold">{s.closed}</td>
                        <td className="text-center text-xs">
                          <span className={`font-bold ${s.avgDays <= 30 ? 'text-green-600' : 'text-orange-600'}`}>
                            {s.avgDays}
                          </span>
                        </td>
                        <td className="text-right text-xs font-bold text-green-600">
                          {formatCurrency(s.economy)}
                        </td>
                        <td className="text-center">
                          {s.overdue > 0
                            ? <span className="text-xs text-red-600 font-bold">⚠ {s.overdue}</span>
                            : <span className="text-xs text-green-500">✓</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── ИТОГОВЫЙ ВЫВОД ────────────────────────────────── */}
        <div className="gov-card p-4" style={{ background: 'linear-gradient(135deg, #001e5e 0%, #003087 100%)' }}>
          <div className="text-white font-bold text-sm mb-3">📋 Сводное заключение по закупочной деятельности</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: '✅', label: 'Бюджет исполняется', desc: `${budgetUsedPct}% плана. Экономия ${economyPct}% — в пределах нормы.`, ok: true },
              { icon: '⏱', label: 'Сроки в норме', desc: 'Среднее время закупки 28 р.д. Этап «Приёмка» — превышение на 2 дня.', ok: true },
              { icon: '⚠', label: 'Требует внимания', desc: `${overdueCount > 0 ? overdueCount + ' просрочки — нужны оперативные действия' : 'Просрочек нет. Системных нарушений не выявлено.'}`, ok: overdueCount === 0 },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <div className="text-white text-xs font-bold mb-0.5">{item.label}</div>
                  <div className="text-blue-200 text-xs opacity-80 leading-snug">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
