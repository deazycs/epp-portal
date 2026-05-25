'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatDate } from '@/lib/utils';
import { AlertTriangle, Clock, CheckCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Deadline {
  id: string;
  procId: string;
  procNum: string;
  title: string;
  type: string;
  date: string;
  daysLeft: number;
  zone: 'red'|'orange'|'yellow'|'green';
  responsible: string;
  status: string;
}

function daysBetween(dateStr: string): number {
  if (!dateStr) return 999;
  const target = new Date(dateStr);
  const now    = new Date();
  target.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function zone(days: number): 'red'|'orange'|'yellow'|'green' {
  if (days < 0)   return 'red';
  if (days <= 3)  return 'orange';
  if (days <= 10) return 'yellow';
  return 'green';
}

const ZONE_STYLE = {
  red:    { cls:'bg-red-50 border-red-300 text-red-800',    badge:'bg-red-500 text-white',    icon:<AlertTriangle size={13}/>, label:'Просрочено' },
  orange: { cls:'bg-orange-50 border-orange-300 text-orange-800', badge:'bg-orange-500 text-white', icon:<AlertTriangle size={13}/>, label:'Критично' },
  yellow: { cls:'bg-yellow-50 border-yellow-300 text-yellow-800', badge:'bg-yellow-400 text-white', icon:<Clock size={13}/>, label:'Внимание' },
  green:  { cls:'bg-green-50 border-green-300 text-green-800',  badge:'bg-green-500 text-white',  icon:<CheckCircle size={13}/>, label:'В норме' },
};

export default function KontrolSrokovPage() {
  const { procurements } = useAppStore();
  const [filter, setFilter] = useState<'all'|'red'|'orange'|'yellow'|'green'>('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const deadlines: Deadline[] = useMemo(() => {
    const result: Deadline[] = [];
    const skip = ['archive','cancelled'];

    procurements.forEach(p => {
      if (skip.includes(p.status)) return;

      // 1. Срок окончания контракта
      if (p.contractEndDate) {
        const d = daysBetween(p.contractEndDate);
        result.push({
          id: `${p.id}-contract`, procId: p.id, procNum: p.registryNumber, title: p.title,
          type: 'Срок договора', date: p.contractEndDate, daysLeft: d,
          zone: zone(d), responsible: p.responsibleName, status: p.status,
        });
      }

      // 2. Срок окончания закупки (если нет договора)
      if (!p.contractEndDate && p.plannedEndDate) {
        const d = daysBetween(p.plannedEndDate);
        result.push({
          id: `${p.id}-planned`, procId: p.id, procNum: p.registryNumber, title: p.title,
          type: 'Плановый срок', date: p.plannedEndDate, daysLeft: d,
          zone: zone(d), responsible: p.responsibleName, status: p.status,
        });
      }

      // 3. Отчётность ЕИС (если статус payment или eis_reporting)
      if (['payment','eis_reporting'].includes(p.status) && p.contractEndDate) {
        // Срок отчётности = 5 рабочих дней после исполнения
        const reportDate = new Date(p.contractEndDate);
        reportDate.setDate(reportDate.getDate() + 7);
        const reportStr = reportDate.toISOString().split('T')[0];
        const d = daysBetween(reportStr);
        if (d <= 30) { // показываем только если скоро
          result.push({
            id: `${p.id}-report`, procId: p.id, procNum: p.registryNumber, title: p.title,
            type: 'Отчётность в ЕИС', date: reportStr, daysLeft: d,
            zone: zone(d), responsible: p.responsibleName, status: p.status,
          });
        }
      }

      // 4. Срок поставки по договору
      const deliveryDate = (p as any).deliveryDate;
      if (deliveryDate && ['execution'].includes(p.status)) {
        const d = daysBetween(deliveryDate);
        const notifId = `delivery-${p.id}`;
        if (d <= 14 || d < 0) {
          result.push({
            id: notifId, procId: p.id, procNum: p.registryNumber, title: p.title,
            type: 'Срок поставки', date: deliveryDate, daysLeft: d,
            zone: zone(d), responsible: p.responsibleName, status: p.status,
          });
        }
      }

      // 5. Срок приёмки (после поставки нужно принять товар)
      const acceptanceDays = (p as any).acceptanceDays;
      const deliveryD = (p as any).deliveryDate;
      if (deliveryD && acceptanceDays && p.status === 'execution' && !(p as any).acceptanceDate) {
        const acceptDeadline = new Date(deliveryD);
        acceptDeadline.setDate(acceptDeadline.getDate() + Number(acceptanceDays));
        const acceptStr = acceptDeadline.toISOString().split('T')[0];
        const d = daysBetween(acceptStr);
        if (d <= 10) {
          result.push({
            id: `accept-${p.id}`, procId: p.id, procNum: p.registryNumber, title: p.title,
            type: 'Срок приёмки товара', date: acceptStr, daysLeft: d,
            zone: zone(d), responsible: p.responsibleName, status: p.status,
          });
        }
      }

      // 6. Размещение в ЕАТ (если статус preparation или sz_approval)
      if (['preparation','financing','sz_approval'].includes(p.status) && p.plannedStartDate) {
        const placementDate = new Date(p.plannedStartDate);
        const d = daysBetween(placementDate.toISOString().split('T')[0]);
        if (d <= 14) {
          result.push({
            id: `${p.id}-placement`, procId: p.id, procNum: p.registryNumber, title: p.title,
            type: 'Плановое размещение', date: placementDate.toISOString().split('T')[0],
            daysLeft: d, zone: zone(d), responsible: p.responsibleName, status: p.status,
          });
        }
      }
    });

    return result.sort((a,b) => a.daysLeft - b.daysLeft);
  }, [procurements]);

  const types = Array.from(new Set(deadlines.map(d => d.type)));

  const filtered = deadlines.filter(d => {
    const okZone = filter === 'all' || d.zone === filter;
    const okType = typeFilter === 'all' || d.type === typeFilter;
    return okZone && okType;
  });

  const counts = {
    red:    deadlines.filter(d=>d.zone==='red').length,
    orange: deadlines.filter(d=>d.zone==='orange').length,
    yellow: deadlines.filter(d=>d.zone==='yellow').length,
    green:  deadlines.filter(d=>d.zone==='green').length,
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Контроль сроков'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Контроль сроков</h1>
            <p className="text-xs text-gray-500">
              Автоматически рассчитывается из реестра закупок · Обновляется в реальном времени
            </p>
          </div>
        </div>

        {/* Подсказка */}
        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <Calendar size={13} className="flex-shrink-0 mt-0.5"/>
          <span>
            Светофор рассчитывается из дат в карточках закупок: срок договора, плановый срок, дата отчётности в ЕИС.
            При создании новой закупки — она автоматически попадёт сюда если срок наступает в ближайшие 14 дней.
          </span>
        </div>

        {/* Светофор */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            {zone:'red'   as const, label:'Просрочено',   icon:<AlertTriangle size={16}/>, cnt:counts.red,    cls:'text-red-600'},
            {zone:'orange'as const, label:'Критично (до 3 дней)', icon:<AlertTriangle size={16}/>, cnt:counts.orange, cls:'text-orange-600'},
            {zone:'yellow'as const, label:'Внимание (до 10 дней)', icon:<Clock size={16}/>, cnt:counts.yellow, cls:'text-yellow-600'},
            {zone:'green' as const, label:'В норме',      icon:<CheckCircle size={16}/>, cnt:counts.green,  cls:'text-green-600'},
          ].map(s=>(
            <button key={s.zone}
              onClick={()=>setFilter(filter===s.zone?'all':s.zone)}
              className={`gov-card p-3 text-left transition-all ${filter===s.zone?'ring-2 ring-blue-500':''}`}>
              <div className={`flex items-center gap-2 mb-1 ${s.cls}`}>
                {s.icon}
                <span className="text-2xl font-bold">{s.cnt}</span>
              </div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Фильтр типа */}
        <div className="gov-card p-1.5 flex gap-1 mb-3 flex-wrap">
          <button onClick={()=>setTypeFilter('all')}
            className={`gov-btn gov-btn-sm ${typeFilter==='all'?'gov-btn-primary':'gov-btn-ghost'}`}>Все типы</button>
          {types.map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)}
              className={`gov-btn gov-btn-sm ${typeFilter===t?'gov-btn-primary':'gov-btn-ghost'}`}>{t}</button>
          ))}
        </div>

        {/* Список дедлайнов */}
        {filtered.length === 0 ? (
          <div className="gov-card p-8 text-center text-gray-400">
            <CheckCircle size={32} className="mx-auto mb-2 text-green-400"/>
            <p className="text-sm font-medium text-green-600">Все сроки в норме!</p>
            <p className="text-xs mt-1">Критических дедлайнов не обнаружено</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(d => {
              const zs = ZONE_STYLE[d.zone];
              return (
                <div key={d.id} className={`border rounded-lg p-3 ${zs.cls}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={`flex-shrink-0 mt-0.5 ${d.zone==='red'?'text-red-500':d.zone==='orange'?'text-orange-500':d.zone==='yellow'?'text-yellow-500':'text-green-500'}`}>
                        {zs.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`gov-badge text-xs px-2 py-0.5 rounded font-bold ${zs.badge}`}>
                            {d.daysLeft < 0
                              ? `Просрочено ${Math.abs(d.daysLeft)} дн.`
                              : d.daysLeft === 0 ? 'Сегодня!'
                              : `${d.daysLeft} дн.`}
                          </span>
                          <span className="text-xs font-bold opacity-80">{d.type}</span>
                          <span className="text-xs font-mono opacity-60">{d.procNum}</span>
                        </div>
                        <div className="text-xs font-bold truncate">{d.title}</div>
                        <div className="text-xs opacity-70 mt-0.5">
                          Срок: {formatDate(d.date)} · Отв.: {d.responsible}
                        </div>
                      </div>
                    </div>
                    <Link href={`/zakupki/${d.procId}`}
                      className="gov-btn gov-btn-sm flex-shrink-0"
                      style={{background:'rgba(0,0,0,0.08)', color:'inherit', border:'none'}}>
                      → Открыть
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Легенда */}
        <div className="gov-card p-3 mt-4">
          <div className="gov-section-title mb-2">📊 Как рассчитываются сроки</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
            {[
              {color:'bg-red-500', text:'Просрочено — дата уже прошла, действие не выполнено'},
              {color:'bg-orange-500', text:'Критично — до срока 0-3 дня, нужно действовать сегодня'},
              {color:'bg-yellow-400', text:'Внимание — до срока 4-10 дней, подготовьтесь заранее'},
              {color:'bg-green-500', text:'В норме — срок более 10 дней, контролируйте регулярно'},
            ].map((l,i)=>(
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: l.color }}/>
                <span>{l.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <strong>Типы дедлайнов отслеживаемых системой:</strong>
            <span className="ml-1">Срок договора · Срок поставки · Срок приёмки · Отчётность в ЕИС (ч.9 ст.94) · Оплата в ФЭО/ФЭО · Плановое размещение</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
