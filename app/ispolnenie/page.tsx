'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { MOCK_CONTRACTS } from '@/mock/data/other';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const EXECUTIONS = [
  { id:'e1', contractNum:'РЗ-2026-00142/Д', procId:'p001', supplier:'ООО ТехноОфис', subject:'Поставка картриджей', stage:'Поставка товара', plannedDate:'2026-06-15', actualDate:null, status:'in_progress', totalSum:156400, completedPct:0 },
  { id:'e2', contractNum:'РЗ-2026-00098/Д', procId:'p009', supplier:'ООО МоскваСофт', subject:'Лицензии Microsoft 365', stage:'Передача лицензий', plannedDate:'2026-04-28', actualDate:'2026-04-28', status:'completed', totalSum:378000, completedPct:100 },
  { id:'e3', contractNum:'РЗ-2026-00056/Д', procId:'p004', supplier:'ЗАО КанцЛайф', subject:'Поставка бумаги А4/А3', stage:'Поставка товара', plannedDate:'2026-04-15', actualDate:'2026-04-15', status:'completed', totalSum:91800, completedPct:100 },
  { id:'e4', contractNum:'РЗ-2026-00089/Д', procId:'p002', supplier:'ООО СитиКомп', subject:'Серверное оборудование', stage:'Заключение договора', plannedDate:'2026-07-31', actualDate:null, status:'planned', totalSum:4720000, completedPct:0 },
  { id:'e5', contractNum:'РЗ-2025-00342/Д', procId:'p006', supplier:'ЗАО КанцЛайф', subject:'Канцтовары IV кв. 2025', stage:'Приёмка выполнена', plannedDate:'2025-12-31', actualDate:'2025-12-20', status:'completed', totalSum:54600, completedPct:100 },
];

const ST: Record<string,{label:string,cls:string}> = {
  planned:     { label:'Запланировано',  cls:'bg-blue-50 text-blue-700 border-blue-300' },
  in_progress: { label:'Исполняется',    cls:'bg-yellow-50 text-yellow-700 border-yellow-300' },
  completed:   { label:'Исполнено',      cls:'bg-green-50 text-green-700 border-green-300' },
  overdue:     { label:'Просрочено',     cls:'bg-red-50 text-red-700 border-red-300' },
};

export default function IspolneniePage() {
  const [sf, setSf] = useState('all');
  const filtered = EXECUTIONS.filter(e => sf === 'all' || e.status === sf);
  const completed = EXECUTIONS.filter(e => e.status === 'completed').length;
  const totalSum = EXECUTIONS.reduce((s,e) => s + e.totalSum, 0);
  const paidSum = EXECUTIONS.filter(e => e.status === 'completed').reduce((s,e) => s + e.totalSum, 0);

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Реестр исполнений'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр исполнений договоров</h1>
            <p className="text-xs text-gray-500">Всего: {EXECUTIONS.length} · Исполнено: {completed}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {label:'Всего этапов',    val:EXECUTIONS.length,      cls:'text-gray-700'},
            {label:'Исполнено',       val:completed,               cls:'text-green-700'},
            {label:'В исполнении',    val:EXECUTIONS.filter(e=>e.status==='in_progress').length, cls:'text-yellow-700'},
            {label:'Общая сумма',     val:formatCurrency(totalSum), cls:'text-blue-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-lg font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="gov-card p-2 mb-3 flex gap-1 flex-wrap">
          {['all','in_progress','planned','completed'].map(s=>(
            <button key={s} onClick={()=>setSf(s)}
              className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
              {{all:'Все',in_progress:'Исполняется',planned:'Запланировано',completed:'Исполнено'}[s as 'all']}
            </button>
          ))}
        </div>

        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>№ Договора</th>
                  <th>Предмет</th>
                  <th>Поставщик</th>
                  <th>Этап</th>
                  <th>Плановая дата</th>
                  <th>Фактическая дата</th>
                  <th>Статус</th>
                  <th className="text-right">Сумма</th>
                  <th>Исполнение</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e=>(
                  <tr key={e.id}>
                    <td className="text-xs font-bold text-blue-600">{e.contractNum}</td>
                    <td className="text-xs">{e.subject}</td>
                    <td className="text-xs font-bold">{e.supplier}</td>
                    <td className="text-xs">{e.stage}</td>
                    <td className="text-xs">{formatDate(e.plannedDate)}</td>
                    <td className="text-xs">
                      {e.actualDate
                        ? <span className="text-green-700 font-bold">✓ {formatDate(e.actualDate)}</span>
                        : <span className="text-gray-400">—</span>}
                    </td>
                    <td><span className={`gov-badge ${ST[e.status].cls}`}>{ST[e.status].label}</span></td>
                    <td className="text-xs font-bold text-right">{formatCurrency(e.totalSum)}</td>
                    <td>
                      <div className="flex items-center gap-2 min-w-20">
                        <div className="gov-progress flex-1"><div className={`gov-progress-bar ${e.completedPct===100?'bg-green-500':'bg-blue-500'}`} style={{width:`${e.completedPct}%`}}/></div>
                        <span className="text-xs font-bold text-gray-600">{e.completedPct}%</span>
                      </div>
                    </td>
                    <td>
                      <Link href={`/zakupki/${e.procId}`} className="gov-btn gov-btn-ghost gov-btn-sm py-0 text-xs">→</Link>
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
