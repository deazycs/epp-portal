'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  ChevronRight, Eye, DollarSign, Target, Users, FileText
} from 'lucide-react';
import Link from 'next/link';

const WEEK_EVENTS = [
  { day: 'Пн', date: '20.05', events: ['Подписан договор с ООО «ТехноОфис» (156 400 руб.)', 'СЗ-ОО-2026-091 направлена на проверку ЛБО'] },
  { day: 'Вт', date: '21.05', events: ['ФЭО подтвердила ЛБО по СЗ-МТО-2026-095', 'Начато исполнение договора РЗ-2026-00142'] },
  { day: 'Ср', date: '22.05', events: ['Получены документы на приёмку от ООО «ТехноОфис»', 'Митусов С.А. подписал акт приёмки картриджей'] },
  { day: 'Чт', date: '23.05', events: ['Документы переданы в ФЭО на оплату', 'Создана новая закупка РЗ-2026-00187'] },
  { day: 'Пт', date: '24.05', events: ['ФЭО провела оплату 156 400 руб. по РЗ-2026-00142', 'Закупка РЗ-2026-00142 переведена в архив'] },
];

const DEPT_STATUS = [
  { name: 'МТО',      head: 'Черемных М.Ю.', active: 4, overdue: 0, pending: 1, light: 'green' },
  { name: 'ИТ-отдел',head: 'Митусов С.А.',  active: 3, overdue: 1, pending: 0, light: 'yellow' },
  { name: 'ОО',       head: 'Давыдова Ф.А.', active: 3, overdue: 0, pending: 2, light: 'green' },
  { name: 'ОГТ',      head: 'Щербинин Р.С.', active: 0, overdue: 0, pending: 1, light: 'gray' },
];

const APPROVAL_QUEUE = [
  { id: 'RZ-001', num: 'РЗ-2026-00187', type: 'Визирование договора', supplier: 'ООО «СитиКомп»', sum: 4720000, waiting: 2, urgent: true },
  { id: 'SZ-001', num: 'СЗ-ИТ-2026-112', type: 'Согласование СЗ', supplier: 'ИТ-отдел (Митусов С.А.)', sum: 1850000, waiting: 1, urgent: false },
  { id: 'RZ-002', num: 'РЗ-2026-00165', type: 'Визирование договора', supplier: 'ООО «МоскваСофт»', sum: 378000, waiting: 4, urgent: true },
];

const RISKS = [
  { text: 'РЗ-2026-00153 — срок поставки истекает через 3 дня', level: 'high', link: '/kontrol-srokov' },
  { text: 'РЗ-2026-00141 — акт приёмки не подписан 7 дней', level: 'high', link: '/priemka' },
  { text: 'Бюджет ОГТ не освоен — рекомендуется перераспределение', level: 'medium', link: '/analitika' },
  { text: 'Договор РЗ-2026-00165 ожидает визы 4 р.д.', level: 'medium', link: '/soglasovaniya' },
];

const LIGHT_COLORS = { green: '#15803d', yellow: '#b45309', red: '#dc2626', gray: '#9ca3af' };
const LIGHT_BG     = { green: '#ecfdf5', yellow: '#fffbeb', red: '#fef2f2', gray: '#f9fafb' };

export default function RukovoditelPage() {
  const { procurements } = useAppStore();

  const totalBudget  = 7510000;
  const contracted   = procurements.reduce((s,p) => s+(p.contractSum??0),0) || 5100000;
  const paid         = procurements.reduce((s,p) => s+(p.paidSum??0),0) || 2940000;
  const economy      = totalBudget - contracted;
  const economyPct   = ((economy/totalBudget)*100).toFixed(1);
  const overdue      = procurements.filter(p=>p.isOverdue).length;
  const active       = procurements.filter(p=>!['archive','cancelled'].includes(p.status)).length;
  const archived     = procurements.filter(p=>p.status==='archive').length;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Панель руководителя'}]}/>

        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="text-base font-bold">Панель руководителя</h1>
            <p className="text-xs text-gray-500">Толоконников Ю.В. · Заместитель руководителя · {new Date().toLocaleDateString('ru-RU')}</p>
          </div>
          <Link href="/analitika" className="gov-btn gov-btn-ghost gov-btn-sm">
            <TrendingUp size={12}/> Полная аналитика
          </Link>
        </div>

        {/* ── KPI ВЕРХНЯЯ СТРОКА ────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Бюджет освоен', val: `${Math.round((contracted/totalBudget)*100)}%`, sub: formatCurrency(contracted) + ' из ' + formatCurrency(totalBudget), color: '#003087', icon: <DollarSign size={15}/> },
            { label: 'Экономия', val: formatCurrency(economy), sub: `${economyPct}% от плана`, color: '#15803d', icon: <TrendingDown size={15}/> },
            { label: 'Оплачено', val: formatCurrency(paid), sub: `${Math.round((paid/contracted)*100)||58}% от договоров`, color: '#0050b3', icon: <CheckCircle size={15}/> },
            { label: 'Просрочки', val: String(overdue || RISKS.filter(r=>r.level==='high').length), sub: 'Требуют решения', color: overdue > 0 ? '#b91c1c' : '#15803d', icon: <AlertTriangle size={15}/> },
          ].map(k => (
            <div key={k.label} className="gov-card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: k.color + '18', color: k.color }}>
                {k.icon}
              </div>
              <div>
                <div className="text-xs text-gray-500">{k.label}</div>
                <div className="text-sm font-bold leading-tight" style={{ color: k.color }}>{k.val}</div>
                <div className="text-xs text-gray-400">{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* ── ТРЕБУЮТ ВИЗЫ ──────────────────────────────────── */}
          <div className="lg:col-span-2 gov-card overflow-hidden">
            <div className="gov-section-title flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText size={13}/> Ожидают вашей визы
              </span>
              <span className="gov-badge bg-red-50 text-red-600 border-red-200">{APPROVAL_QUEUE.length} документа</span>
            </div>
            <div className="divide-y divide-gray-50">
              {APPROVAL_QUEUE.map(item => (
                <div key={item.id} className={`p-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors ${item.urgent ? 'border-l-4 border-orange-400' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono font-bold text-blue-600">{item.num}</span>
                      <span className="gov-badge bg-purple-50 text-purple-700 border-purple-200 text-xs">{item.type}</span>
                      {item.urgent && <span className="gov-badge bg-orange-50 text-orange-700 border-orange-200 text-xs">⚡ Срочно</span>}
                    </div>
                    <div className="text-xs text-gray-600">{item.supplier}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      <span className="font-bold text-blue-700">{formatCurrency(item.sum)}</span>
                      <span className="ml-2">· ожидает {item.waiting} р.д.</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href="/soglasovaniya" className="gov-btn gov-btn-success gov-btn-sm">
                      Визировать
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <Link href="/soglasovaniya" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                Все согласования <ChevronRight size={11}/>
              </Link>
            </div>
          </div>

          {/* ── СВЕТОФОР ПОДРАЗДЕЛЕНИЙ ────────────────────────── */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title flex items-center gap-2">
              <Target size={13}/> Статус подразделений
            </div>
            <div className="p-3 space-y-2">
              {DEPT_STATUS.map(d => (
                <div key={d.name} className="p-2.5 rounded-xl border transition-all"
                  style={{ background: LIGHT_BG[d.light as keyof typeof LIGHT_BG], borderColor: LIGHT_COLORS[d.light as keyof typeof LIGHT_COLORS] + '40' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: LIGHT_COLORS[d.light as keyof typeof LIGHT_COLORS] }}/>
                      <span className="text-xs font-bold">{d.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{d.head}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600">Активных: <b>{d.active}</b></span>
                    {d.overdue > 0 && <span className="text-red-600 font-bold">⚠ {d.overdue} просрочка</span>}
                    {d.pending > 0 && <span className="text-orange-600">⏳ {d.pending} ожид.</span>}
                    {d.overdue === 0 && d.pending === 0 && d.active > 0 && <span className="text-green-600">✓ норма</span>}
                    {d.active === 0 && <span className="text-gray-400">нет активных</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── РИСКИ И СОБЫТИЯ НЕДЕЛИ ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Риски */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title flex items-center gap-2">
              <AlertTriangle size={13}/> Риски и нарушения
            </div>
            <div className="divide-y divide-gray-50">
              {RISKS.map((r, i) => (
                <Link key={i} href={r.link}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors group">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${r.level === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}/>
                  <span className="text-xs text-gray-700 flex-1 leading-relaxed group-hover:text-blue-600 transition-colors">
                    {r.text}
                  </span>
                  <ChevronRight size={11} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors"/>
                </Link>
              ))}
            </div>
          </div>

          {/* События недели */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title flex items-center gap-2">
              <Clock size={13}/> Хроника недели
            </div>
            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
              {WEEK_EVENTS.map(day => (
                <div key={day.day} className="flex gap-3">
                  <div className="flex-shrink-0 text-center w-10">
                    <div className="text-xs font-bold text-blue-700">{day.day}</div>
                    <div className="text-xs text-gray-400">{day.date}</div>
                  </div>
                  <div className="flex-1 space-y-1 pb-2 border-b border-gray-50 last:border-0">
                    {day.events.map((e, i) => (
                      <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0 mt-1.5"/>
                        {e}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ИТОГ ДЛЯ РУКОВОДИТЕЛЯ ────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '✅', label: 'Финансовая дисциплина', val: `Экономия ${economyPct}%`, desc: 'Бюджет исполняется в плановых показателях. КСП нарушений не выявит.', color: '#15803d' },
            { icon: '📋', label: 'Документооборот', val: `${APPROVAL_QUEUE.length} ожидают`, desc: `${APPROVAL_QUEUE.filter(a=>a.urgent).length} срочных. Рекомендуется рассмотреть сегодня.`, color: '#b45309' },
            { icon: '⏱', label: 'Сроки исполнения', val: `${archived} завершено`, desc: `${active} в работе. Среднее время закупки — 28 рабочих дней.`, color: '#003087' },
          ].map(item => (
            <div key={item.label} className="gov-card p-4" style={{ borderLeft: `4px solid ${item.color}` }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-xs text-gray-500">{item.label}</div>
                  <div className="text-sm font-bold" style={{ color: item.color }}>{item.val}</div>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
