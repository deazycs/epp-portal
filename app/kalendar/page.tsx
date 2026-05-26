'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const DOW = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDow(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}


const TYPE_COLORS: Record<string,string> = {
  deadline: 'bg-red-100 text-red-700',
  contract: 'bg-green-100 text-green-700',
  payment: 'bg-orange-100 text-orange-700',
  task: 'bg-blue-100 text-blue-700',
  approval: 'bg-yellow-100 text-yellow-700',
};

export default function KalendarPage() {
  const { procurements, tasks } = useAppStore();
const EVENTS = [
    ...procurements
    .filter(p => p.contractEndDate)
    .map(p => ({ date: p.contractEndDate!, label: `Срок дог.: ${p.registryNumber}`, type: 'deadline', href: `/zakupki/${p.id}` })),
    ...procurements
    .filter(p => p.contractDate)
    .map(p => ({ date: p.contractDate!, label: `Договор: ${p.registryNumber}`, type: 'contract', href: `/zakupki/${p.id}` })),
  { date: '2026-05-22', label: 'Срок оплаты: бумага А4', type: 'payment', href: '/platezhi' },
  { date: '2026-05-28', label: 'Срок ТЗ: интеграционный модуль', type: 'task', href: '/zadachi' },
  { date: '2026-06-01', label: 'Согласование: уборка', type: 'approval', href: '/soglasovaniya' },
  { date: '2026-06-13', label: 'Подписание дог.: мебель', type: 'contract', href: '/zakupki/p008' },
];
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const days = getDaysInMonth(year, month);
  const firstDow = getFirstDow(year, month);
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null as null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return EVENTS.filter(e => e.date === dateStr);
  };

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const upcomingEvents = EVENTS
    .filter(e => new Date(e.date) >= today)
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0,8);

  return (
    <AppLayout>
      <div className="p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Календарь'}]} />
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-base font-bold">Календарь контрольных дат</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Календарная сетка */}
          <div className="lg:col-span-2 gov-card">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
              <button onClick={prev} className="gov-btn gov-btn-ghost gov-btn-sm px-2">←</button>
              <span className="text-sm font-bold text-gray-800">{MONTHS[month]} {year}</span>
              <button onClick={next} className="gov-btn gov-btn-ghost gov-btn-sm px-2">→</button>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-7 mb-1">
                {DOW.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {cells.map((day, i) => {
                  const evs = eventsForDay(day);
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  return (
                    <div key={i} className={`min-h-14 p-1 border border-gray-100 rounded ${!day ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'} ${isToday ? 'border-blue-400 bg-blue-50' : ''}`}>
                      {day && (
                        <>
                          <div className={`text-xs font-bold mb-0.5 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{day}</div>
                          <div className="space-y-0.5">
                            {evs.slice(0,2).map((e,j) => (
                              <Link key={j} href={e.href} className={`block text-xs px-1 py-0.5 rounded truncate leading-tight ${TYPE_COLORS[e.type]}`} title={e.label}>
                                {e.label}
                              </Link>
                            ))}
                            {evs.length > 2 && <div className="text-xs text-gray-400">+{evs.length-2}</div>}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Легенда */}
              <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100">
                {Object.entries(TYPE_COLORS).map(([type, cls]) => (
                  <span key={type} className={`text-xs px-1.5 py-0.5 rounded ${cls}`}>
                    {{ deadline:'Срок договора', contract:'Подписание', payment:'Оплата', task:'Задача', approval:'Согласование' }[type]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ближайшие события */}
          <div className="gov-card">
            <div className="gov-section-title">📅 Ближайшие события</div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.map((e,i) => (
                <Link key={i} href={e.href} className="block px-3 py-2 hover:bg-gray-50 transition-colors">
                  <div className="text-xs text-gray-400 font-mono">{formatDate(e.date)}</div>
                  <div className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded inline-block ${TYPE_COLORS[e.type]}`}>{e.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
