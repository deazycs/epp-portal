'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// В разделе платежей — закупки на этапе оплаты и исполнения с суммами
const PAYMENT_STATUSES = ['payment','payment_docs','payment_sufd','payment_done','execution','eis_reporting','archive'];

export default function PlatezhiPage() {
  const { procurements } = useAppStore();
  const [sf, setSf] = useState('all');

  const payments = useMemo(() =>
    procurements.filter(p => PAYMENT_STATUSES.includes(p.status) && p.contractSum)
      .sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)),
    [procurements]
  );

  const filtered = sf === 'all' ? payments : payments.filter(p => {
    if (sf === 'pending') return ['payment','payment_docs'].includes(p.status) && !p.paidSum;
    if (sf === 'paid')    return p.status === 'payment_done' || (p.paidSum??0) >= (p.contractSum??0);
    if (sf === 'partial') return (p.paidSum??0) > 0 && (p.paidSum??0) < (p.contractSum??1);
    if (sf === 'overdue') return p.isOverdue;
    return true;
  });

  const totalPending = payments.filter(p=>p.status==='payment'&&!(p.paidSum)).reduce((s,p)=>s+(p.contractSum??0),0);
  const totalPaid    = payments.reduce((s,p)=>s+(p.paidSum??0),0);
  const overdueCnt   = payments.filter(p=>p.isOverdue).length;

  const STATUS_INFO: Record<string,{label:string;cls:string;icon:React.ReactNode}> = {
    payment:      {label:'Ожидает оплаты', cls:'bg-orange-50 text-orange-700 border-orange-300', icon:<Clock size={11}/>},
    execution:    {label:'Исполнение',     cls:'bg-blue-50 text-blue-700 border-blue-300',   icon:<CreditCard size={11}/>},
    eis_reporting:{label:'Отчётность ЕИС', cls:'bg-sky-50 text-sky-700 border-sky-300',     icon:<CheckCircle size={11}/>},
    archive:      {label:'Архив',          cls:'bg-gray-100 text-gray-600 border-gray-300', icon:<CheckCircle size={11}/>},
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Платежи'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Платежи</h1>
            <p className="text-xs text-gray-500">
              Договоры ожидающие оплаты — формируются из реестра закупок автоматически
            </p>
          </div>
        </div>

        <div className="gov-alert gov-alert-info mb-3 text-xs">
          <CreditCard size={13} className="flex-shrink-0 mt-0.5"/>
          <span>
            Запись появляется здесь когда закупка переходит на этап «Оплата».
            Бухгалтер видит сумму, поставщика и реквизиты договора — всё из карточки закупки.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            {label:'Всего записей',    val:payments.length,           cls:'text-gray-700',   icon:<CreditCard size={14}/>},
            {label:'К оплате',         val:formatCurrency(totalPending), cls:'text-orange-600', icon:<Clock size={14}/>},
            {label:'Оплачено',         val:formatCurrency(totalPaid),    cls:'text-green-700',  icon:<CheckCircle size={14}/>},
            {label:'Просрочено',       val:overdueCnt,                cls:overdueCnt>0?'text-red-600':'text-gray-400', icon:<AlertTriangle size={14}/>},
          ].map(s=>(
            <div key={s.label} className="gov-card p-3 flex items-start gap-2">
              <div className={`mt-0.5 ${s.cls}`}>{s.icon}</div>
              <div>
                <div className={`text-lg font-bold leading-tight ${s.cls}`}>{s.val}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="gov-card p-1.5 flex gap-1 mb-3 flex-wrap">
          {[
            {k:'all',     l:'Все'},
            {k:'pending', l:'Ожидают оплаты'},
            {k:'paid',    l:'Оплачены'},
            {k:'overdue', l:'Просрочены'},
          ].map(b=>(
            <button key={b.k} onClick={()=>setSf(b.k)}
              className={`gov-btn gov-btn-sm ${sf===b.k?'gov-btn-primary':'gov-btn-ghost'}`}>
              {b.l}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="gov-card p-8 text-center text-gray-400">
            <CreditCard size={32} className="mx-auto mb-2 opacity-20"/>
            <p className="text-sm">Платежей нет</p>
            <p className="text-xs mt-1">Переведите закупку на этап «Оплата» — она появится здесь</p>
          </div>
        ) : (
          <div className="gov-card overflow-hidden">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Закупка</th>
                  <th>Поставщик</th>
                  <th>Статус</th>
                  <th className="text-right">Сумма договора</th>
                  <th className="text-right">Оплачено</th>
                  <th>Срок</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const paidPct = p.contractSum ? Math.round((p.paidSum??0)/p.contractSum*100) : 0;
                  const info = STATUS_INFO[p.status] ?? {label:p.status,cls:'',icon:null};
                  return (
                    <tr key={p.id} className={p.isOverdue?'bg-red-50':''}>
                      <td>
                        <div className="text-xs font-mono font-bold text-blue-600">{p.registryNumber}</div>
                        <div className="text-xs text-gray-700 max-w-xs truncate">{p.title}</div>
                        {p.eatNumber && <div className="text-xs font-mono text-gray-400">{p.eatNumber}</div>}
                      </td>
                      <td>
                        <div className="text-xs font-bold">{p.supplierName??'—'}</div>
                        <div className="text-xs text-gray-400">{p.supplierInn}</div>
                      </td>
                      <td>
                        <span className={`gov-badge flex items-center gap-1 ${info.cls}`}>
                          {info.icon} {info.label}
                        </span>
                        {p.isOverdue && (
                          <div className="text-xs text-red-600 font-bold mt-0.5 flex items-center gap-1">
                            <AlertTriangle size={10}/> Просрочка {p.overduedays}д.
                          </div>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="text-xs font-bold">{formatCurrency(p.contractSum??0)}</div>
                      </td>
                      <td className="text-right">
                        <div className={`text-xs font-bold ${paidPct===100?'text-green-600':paidPct>0?'text-blue-600':'text-gray-400'}`}>
                          {formatCurrency(p.paidSum??0)}
                        </div>
                        <div className="w-16 gov-progress mt-0.5 ml-auto">
                          <div className="gov-progress-bar"
                            style={{width:`${paidPct}%`, background:paidPct===100?'#16a34a':'#2563eb'}}/>
                        </div>
                      </td>
                      <td className="text-xs text-gray-500">
                        {formatDate(p.contractEndDate??p.plannedEndDate)}
                      </td>
                      <td>
                        <Link href={`/zakupki/${p.id}`}
                          className="gov-btn gov-btn-ghost gov-btn-sm text-xs">→</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="text-xs font-bold text-gray-700 px-3 py-2">Итого</td>
                  <td className="text-right text-xs font-bold px-3 py-2">{formatCurrency(filtered.reduce((s,p)=>s+(p.contractSum??0),0))}</td>
                  <td className="text-right text-xs font-bold text-green-700 px-3 py-2">{formatCurrency(filtered.reduce((s,p)=>s+(p.paidSum??0),0))}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
