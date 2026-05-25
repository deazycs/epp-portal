'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, AlertTriangle, CheckCircle, Clock, Bell, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge, RiskBadge } from '@/components/ui/index';
import { STATUS_LABELS } from '@/mock/data/procurements';
import { MOCK_NOTIFICATIONS, MOCK_TASKS, MOCK_RISKS, ANALYTICS_MONTHLY } from '@/mock/data/other';
import { MOCK_USERS } from '@/mock/data/users';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useAppStore } from '@/store/index';
import { PresentationMode } from '@/components/ui/PresentationMode';
import { formatCurrency, formatDate, formatTimeAgo, truncate } from '@/lib/utils';

const PIE_COLORS = ['#94a3b8','#f59e0b','#3b82f6','#8b5cf6','#06b6d4','#22c55e','#64748b'];

const FEED = [
  { id:1, icon:'✏️', user:'Швецов К.Е.', action:'изменил статус', entity:'РЗ-2026-00142', time:'12 мин. назад', href:'/zakupki/p001' },
  { id:2, icon:'✅', user:'Черемных М.Ю.', action:'согласовала закупку', entity:'РЗ-2026-00134', time:'1 ч. назад', href:'/zakupki/p008' },
  { id:3, icon:'📄', user:'Болдина А.В.', action:'загрузил договор', entity:'РЗ-2026-00142/Д', time:'2 ч. назад', href:'/dokumenty' },
  { id:4, icon:'💳', user:'Пикинер О.В.', action:'провела оплату', entity:'378 000 руб.', time:'3 ч. назад', href:'/platezhi' },
  { id:5, icon:'⚠️', user:'Система', action:'зафиксировала риск', entity:'Просрочка платежа', time:'5 ч. назад', href:'/riski' },
];

export default function DashboardPage() {
  const { procurements, tasks, notifications, reset } = useAppStore();

  const today = new Date().toLocaleDateString('ru-RU', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  const active = procurements.filter(p => !['archive','cancelled'].includes(p.status));
  const overdue = procurements.filter(p => p.isOverdue);
  const openRisks = MOCK_RISKS.filter(r => r.status === 'open');
  const unread = notifications.filter(n => !n.isRead);
  const myTasks = tasks.filter(t => t.assigneeId === 'u_shv' && ['new','in_progress','overdue'].includes(t.status));
  const onlineUsers = MOCK_USERS.filter(u => u.id);

  const totalPlanned = procurements.reduce((s,p) => s+p.plannedSum, 0);
  const totalContract = procurements.reduce((s,p) => s+(p.contractSum??0), 0);
  const totalPaid = procurements.reduce((s,p) => s+(p.paidSum??0), 0);

  // Данные для пай-чарта по статусам
  const statusData = Object.entries(
    procurements.reduce((acc, p) => {
      const label = STATUS_LABELS[p.status] ?? p.status;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {} as Record<string,number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <AppLayout>
      <div className="p-3 space-y-3">

        {/* Шапка */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-800">Рабочий стол</h1>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">ЕПП</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{today}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <PresentationMode />
            <button onClick={reset} title="Сбросить к демо-данным"
              className="gov-btn gov-btn-ghost gov-btn-sm text-gray-400">
              <RefreshCw size={12} /> Демо-сброс
            </button>
            <Link href="/zakupki/novaya" className="gov-btn gov-btn-primary gov-btn-sm">+ Новая закупка</Link>
          </div>
        </div>

        {/* Критический алерт */}
        {overdue.length > 0 && (
          <div className="gov-alert gov-alert-danger">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0 text-xs">
              <strong>Требует немедленного внимания: </strong>
              {overdue.length} просроченных закупок · {openRisks.filter(r=>r.level==='high').length} риска высокого уровня
              <Link href="/kontrol-srokov" className="ml-2 font-bold underline">Перейти →</Link>
            </div>
          </div>
        )}

        {/* KPI плитки */}

        {/* ── БЫСТРЫЕ ДЕЙСТВИЯ ── */}
        <div className="gov-card overflow-hidden mb-4">
          <div className="gov-section-title">⚡ Быстрые действия</div>
          <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { icon:'📋', label:'Новая закупка', desc:'Создать из формы', href:'/zakupki/novaya', cls:'bg-blue-600 hover:bg-blue-700 text-white' },
              { icon:'📊', label:'Сравнить КП', desc:'Анализ рынка / НМЦК', href:'/kp', cls:'bg-indigo-600 hover:bg-indigo-700 text-white' },
              { icon:'✅', label:'Приёмка товара', desc:'Акт приёмочной комиссии', href:'/priemka', cls:'bg-green-700 hover:bg-green-800 text-white' },
              { icon:'📄', label:'Служебная записка', desc:'Зарегистрировать СЗ', href:'/sluzhebnye-zapiski', cls:'bg-gray-700 hover:bg-gray-800 text-white' },
            ].map(a => (
              <Link key={a.label} href={a.href}
                className={`flex items-start gap-2 p-3 rounded-lg transition-all ${a.cls}`}>
                <span className="text-xl flex-shrink-0">{a.icon}</span>
                <div>
                  <div className="text-xs font-bold leading-tight">{a.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>
          {/* Быстрые переходы по активным закупкам требующим действия */}
          {procurements.filter(p => ['sz_approval','winner_approval','contract_expertise','deputy_signing'].includes(p.status)).length > 0 && (
            <div className="px-3 pb-3 border-t border-gray-100 pt-2">
              <div className="text-xs font-bold text-gray-500 mb-2">Требуют вашего решения прямо сейчас:</div>
              <div className="space-y-1">
                {procurements
                  .filter(p => ['sz_approval','winner_approval','contract_expertise','deputy_signing'].includes(p.status))
                  .slice(0, 3)
                  .map(p => (
                  <Link key={p.id} href={`/zakupki/${p.id}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors">
                    <div>
                      <span className="text-xs font-mono text-orange-700">{p.registryNumber}</span>
                      <span className="text-xs text-gray-700 ml-2">{p.title.slice(0,45)}…</span>
                    </div>
                    <span className="text-xs text-orange-600 font-bold flex-shrink-0 ml-2">→ {STATUS_LABELS[p.status]}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { label:'Активных закупок', value:active.length, icon:<ShoppingCart size={13}/>, href:'/zakupki', color:'text-blue-700', bg:'bg-blue-50' },
            { label:'Просрочек', value:overdue.length, icon:<AlertTriangle size={13}/>, href:'/kontrol-srokov', color:overdue.length>0?'text-red-600':'text-gray-400', bg:overdue.length>0?'bg-red-50':'bg-gray-50' },
            { label:'Открытых рисков', value:openRisks.length, icon:<AlertTriangle size={13}/>, href:'/riski', color:'text-orange-600', bg:'bg-orange-50' },
            { label:'Моих задач', value:myTasks.length, icon:<CheckCircle size={13}/>, href:'/zadachi', color:'text-green-700', bg:'bg-green-50' },
            { label:'Уведомлений', value:unread.length, icon:<Bell size={13}/>, href:'/uvedomleniya', color:'text-purple-700', bg:'bg-purple-50' },
            { label:'Онлайн', value:onlineUsers.length, icon:<Users size={13}/>, href:'/polzovateli', color:'text-teal-700', bg:'bg-teal-50' },
          ].map(k => (
            <Link key={k.label} href={k.href} className="gov-card p-2.5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-1">
                <span className="text-xs text-gray-500 leading-tight">{k.label}</span>
                <span className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${k.bg} ${k.color}`}>{k.icon}</span>
              </div>
              <div className={`text-2xl font-bold leading-none ${k.color}`}>{k.value}</div>
            </Link>
          ))}
        </div>

        {/* Финансы с анимированным счётчиком */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="gov-card p-3">
            <div className="text-xs text-gray-500 mb-1">Плановая стоимость 2026</div>
            <div className="text-xl font-bold text-gray-800">
              <AnimatedCounter value={totalPlanned} formatter={v => formatCurrency(v)}/>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Все закупки в реестре</div>
          </div>
          <div className="gov-card p-3">
            <div className="text-xs text-gray-500 mb-1">Заключено договоров</div>
            <div className="text-xl font-bold text-blue-700">
              <AnimatedCounter value={totalContract} formatter={v => formatCurrency(v)}/>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Экономия: <span className="text-green-600 font-bold">
                <AnimatedCounter value={totalPlanned - totalContract} formatter={v => formatCurrency(v)}/>
              </span>
            </div>
          </div>
          <div className="gov-card p-3 border-l-4 border-l-green-400">
            <div className="text-xs text-gray-500 mb-1">💰 Экономия бюджета</div>
            <div className="text-2xl font-bold text-green-700">
              <AnimatedCounter value={totalPlanned - totalContract} duration={2200} formatter={v => formatCurrency(v)}/>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {totalPlanned > 0 && `${((1 - totalContract/totalPlanned)*100).toFixed(1)}% от плановой стоимости`}
            </div>
          </div>
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 gov-card">
            <div className="gov-section-title flex items-center justify-between">
              <span>📊 Динамика закупок 2026</span>
              <Link href="/analitika" className="text-xs text-blue-600 hover:underline normal-case font-normal">Подробнее →</Link>
            </div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={ANALYTICS_MONTHLY} margin={{top:4,right:8,left:-10,bottom:0}}>
                  <XAxis dataKey="month" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:10}}/>
                  <Tooltip formatter={(v:number,name:string)=>[name==='sum'?formatCurrency(v):v, name==='sum'?'Сумма':'Завершено']} contentStyle={{fontSize:11}}/>
                  <Bar dataKey="sum" fill="#003087" radius={[2,2,0,0]}/>
                  <Bar dataKey="completed" fill="#22c55e" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="gov-card">
            <div className="gov-section-title">🔵 Статусы</div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={110}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} dataKey="value">
                    {statusData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{fontSize:10}}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-0.5 mt-1">
                {statusData.slice(0,5).map((item,i)=>(
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{background:PIE_COLORS[i%PIE_COLORS.length]}}/>
                      <span className="text-gray-500 truncate">{item.name}</span>
                    </span>
                    <span className="font-bold ml-1">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Таблица закупок + уведомления */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 gov-card">
            <div className="gov-section-title flex items-center justify-between">
              <span>📋 Активные закупки</span>
              <Link href="/zakupki" className="text-xs text-blue-600 hover:underline normal-case font-normal">Все ({active.length}) →</Link>
            </div>
            {/* Desktop таблица */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr><th>Номер</th><th>Наименование</th><th>Статус</th><th className="text-right">Сумма</th><th>Срок</th></tr>
                </thead>
                <tbody>
                  {active.slice(0,7).map(p=>(
                    <tr key={p.id}>
                      <td><Link href={`/zakupki/${p.id}`} className="text-blue-600 hover:underline font-bold text-xs whitespace-nowrap">{p.registryNumber}</Link></td>
                      <td><div className="text-xs leading-tight">{truncate(p.title,42)}</div><div className="text-xs text-gray-400">{p.departmentName}</div></td>
                      <td><StatusBadge status={p.status}/></td>
                      <td className="text-xs font-bold text-right whitespace-nowrap">{formatCurrency(p.plannedSum)}</td>
                      <td className="text-xs whitespace-nowrap">
                        {p.isOverdue ? <span className="text-red-600 font-bold">Просрочено {p.overduedays}д.</span> : <span className="text-gray-500">{formatDate(p.plannedEndDate)}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile карточки */}
            <div className="sm:hidden divide-y divide-gray-100">
              {active.slice(0,5).map(p=>(
                <Link key={p.id} href={`/zakupki/${p.id}`} className="block p-3 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-blue-600">{p.registryNumber}</div>
                      <div className="text-xs text-gray-700 mt-0.5 leading-tight">{truncate(p.title,50)}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{p.departmentName}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <StatusBadge status={p.status}/>
                      <span className="text-xs font-bold text-gray-700">{formatCurrency(p.plannedSum)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="gov-card">
            <div className="gov-section-title flex items-center justify-between">
              <span>🔔 Уведомления</span>
              <Link href="/uvedomleniya" className="text-xs text-blue-600 hover:underline normal-case font-normal">Все ({unread.length}) →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {unread.slice(0,5).map(n=>(
                <Link key={n.id} href={n.link??'/uvedomleniya'} className="flex items-start gap-2 px-3 py-2 hover:bg-gray-50 block">
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.type==='warning'?'bg-yellow-500':n.type==='error'?'bg-red-500':n.type==='success'?'bg-green-500':'bg-blue-500'}`}/>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-800 leading-tight">{n.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-tight">{n.message}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(n.createdAt)}</div>
                  </div>
                </Link>
              ))}
              {unread.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-gray-400">Нет новых уведомлений</div>
              )}
            </div>
          </div>
        </div>

        {/* Лента + Риски + Задачи */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 gov-card">
            <div className="gov-section-title flex items-center justify-between">
              <span>📌 Лента активности</span>
              <Link href="/zhurnal" className="text-xs text-blue-600 hover:underline normal-case font-normal">Журнал →</Link>
            </div>
            <div className="divide-y divide-gray-100">
              {FEED.map(item=>(
                <Link key={item.id} href={item.href} className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 block">
                  <span className="text-sm flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0 text-xs">
                    <span className="font-bold text-gray-800">{item.user}</span>{' '}
                    <span className="text-gray-600">{item.action}:</span>{' '}
                    <span className="text-blue-600 font-bold">{item.entity}</span>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{item.time}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {/* Риски */}
            <div className="gov-card">
              <div className="gov-section-title flex items-center justify-between">
                <span>⚠ Риски</span>
                <Link href="/riski" className="text-xs text-blue-600 hover:underline normal-case font-normal">Все →</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {openRisks.map(r=>(
                  <div key={r.id} className="px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs text-gray-800 leading-tight flex-1 min-w-0">{truncate(r.title,45)}</div>
                      <RiskBadge level={r.level}/>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{r.owner}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Мои задачи */}
            <div className="gov-card">
              <div className="gov-section-title flex items-center justify-between">
                <span>✅ Мои задачи</span>
                <Link href="/zadachi" className="text-xs text-blue-600 hover:underline normal-case font-normal">Все →</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {myTasks.slice(0,4).map(t=>(
                  <Link key={t.id} href="/zadachi" className="px-3 py-2 block hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-1">
                      <div className="text-xs text-gray-800 leading-tight flex-1 min-w-0">{truncate(t.title,38)}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${t.status==='overdue'?'bg-red-100 text-red-700':t.status==='in_progress'?'bg-yellow-100 text-yellow-700':'bg-blue-100 text-blue-700'}`}>
                        {t.status==='overdue'?'Просрочена':t.status==='in_progress'?'В работе':'Новая'}
                      </span>
                    </div>
                    {t.dueDate&&<div className="text-xs text-gray-400 mt-0.5">до {formatDate(t.dueDate)}</div>}
                  </Link>
                ))}
                {myTasks.length===0&&<div className="px-3 py-4 text-center text-xs text-gray-400">Нет активных задач</div>}
              </div>
            </div>

            {/* Онлайн */}
            <div className="gov-card">
              <div className="gov-section-title">👥 Онлайн</div>
              <div className="p-2 space-y-1">
                {MOCK_USERS.map(u=>(
                  <div key={u.id} className="flex items-center gap-2 px-1 py-0.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${true?'bg-green-500':'bg-gray-300'}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{u.nameShort}</div>
                      <div className="text-xs text-gray-400 leading-tight truncate">{u.position}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
