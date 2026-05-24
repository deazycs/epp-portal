'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { Search, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/index';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

const PAYMENTS = [
  { id:'py1', contract:'РЗ-2026-00098/Д', proc:'p009', desc:'Оплата Microsoft 365 (50 лицензий)', supplier:'ООО МоскваСофт', amount:378000, planned:'2026-05-10', actual:'2026-05-01', status:'completed', order:'ПП-002145' },
  { id:'py2', contract:'РЗ-2026-00056/Д', proc:'p004', desc:'Оплата поставки бумаги А4/А3', supplier:'ЗАО КанцЛайф', amount:91800, planned:'2026-05-15', actual:null, status:'overdue', order:null },
  { id:'py3', contract:'РЗ-2026-00142/Д', proc:'p001', desc:'Оплата картриджей II кв. 2026', supplier:'ООО ТехноОфис', amount:156400, planned:'2026-06-30', actual:null, status:'planned', order:null },
  { id:'py4', contract:'РЗ-2026-00089/Д', proc:'p002', desc:'Авансовый платёж — серверы (30%)', supplier:'ООО СитиКомп', amount:1416000, planned:'2026-07-15', actual:null, status:'planned', order:null },
  { id:'py5', contract:'РЗ-2025-00342/Д', proc:'p006', desc:'Оплата канцтоваров IV кв. 2025', supplier:'ЗАО КанцЛайф', amount:54600, planned:'2025-12-25', actual:'2025-12-24', status:'completed', order:'ПП-001876' },
];

const ST: Record<string,{label:string,cls:string}> = {
  planned:   {label:'Запланирован',  cls:'bg-blue-50 text-blue-700 border-blue-300'},
  completed: {label:'Оплачен',       cls:'bg-green-50 text-green-700 border-green-300'},
  overdue:   {label:'Просрочен',     cls:'bg-red-50 text-red-700 border-red-300'},
  cancelled: {label:'Отменён',       cls:'bg-gray-100 text-gray-500 border-gray-300'},
};

export default function PlatezhiPage() {
  const { procurements } = useAppStore();
  const totalPaid = procurements.reduce((s,p) => s+(p.paidSum??0), 0);

  const [sf,setSf]=useState('all');
  const filtered = PAYMENTS.filter(p=>sf==='all'||p.status===sf);
  const paid=PAYMENTS.filter(p=>p.status==='completed').reduce((s,p)=>s+p.amount,0);
  const pending=PAYMENTS.filter(p=>p.status==='planned').reduce((s,p)=>s+p.amount,0);
  const overdue=PAYMENTS.filter(p=>p.status==='overdue').reduce((s,p)=>s+p.amount,0);

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Реестр платежей'}]}/>
        <h1 className="text-base font-bold mb-3">Реестр платежей</h1>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {label:'Всего',val:PAYMENTS.length,cls:'text-gray-700'},
            {label:'Оплачено',val:formatCurrency(paid),cls:'text-green-700'},
            {label:'К оплате',val:formatCurrency(pending),cls:'text-blue-700'},
            {label:'Просрочено',val:formatCurrency(overdue),cls:'text-red-600'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-lg font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {PAYMENTS.some(p=>p.status==='overdue')&&(
          <div className="gov-alert gov-alert-danger mb-3">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5"/>
            <div className="text-xs"><strong>Просроченный платёж!</strong> ЗАО КанцЛайф — {formatCurrency(91800)}. Срок: 15.05.2026.
              <Link href="/zakupki/p004" className="ml-2 underline font-bold">Перейти к закупке →</Link>
            </div>
          </div>
        )}

        <div className="gov-card p-2 mb-3 flex gap-1 flex-wrap">
          {['all','planned','completed','overdue'].map(s=>(
            <button key={s} onClick={()=>setSf(s)} className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
              {{all:'Все',planned:'Запланированные',completed:'Оплаченные',overdue:'Просроченные'}[s as 'all']}
            </button>
          ))}
        </div>

        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr><th>№ Договора</th><th>Описание</th><th>Поставщик</th><th className="text-right">Сумма</th><th>Плановая дата</th><th>Фактическая</th><th>Статус</th><th>№ ПП</th><th>Действия</th></tr>
              </thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id} className={p.status==='overdue'?'bg-red-50':''}>
                    <td>
                      <div className="text-xs font-bold text-blue-600">{p.contract}</div>
                    </td>
                    <td className="text-xs">{p.desc}</td>
                    <td className="text-xs font-bold">{p.supplier}</td>
                    <td className="text-xs font-bold text-right">{formatCurrency(p.amount)}</td>
                    <td className={`text-xs ${p.status==='overdue'?'text-red-600 font-bold':''}`}>{formatDate(p.planned)}</td>
                    <td className="text-xs">{p.actual?<span className="text-green-700 font-bold">✓ {formatDate(p.actual)}</span>:<span className="text-gray-400">—</span>}</td>
                    <td><span className={`gov-badge ${ST[p.status].cls}`}>{p.status==='overdue'&&'⚠ '}{ST[p.status].label}</span></td>
                    <td className="text-xs font-mono text-gray-500">{p.order??'—'}</td>
                    <td>
                      {p.status==='overdue'&&<Link href={`/zakupki/${p.proc}`} className="gov-btn gov-btn-danger gov-btn-sm py-0 text-xs">Устранить</Link>}
                      {p.status==='planned'&&<button className="gov-btn gov-btn-secondary gov-btn-sm py-0 text-xs">Оформить</button>}
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
