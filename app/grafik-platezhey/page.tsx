'use client';

import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь',
                'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

export default function GrafikPage() {
  const { procurements } = useAppStore();
  const [viewMode, setViewMode] = useState<'list'|'calendar'>('list');
  const [monthFilter, setMonthFilter] = useState<number | null>(null);

  // Формируем план платежей из закупок с договорами
  const payments = useMemo(() => {
    return procurements
      .filter(p => p.contractSum && p.contractEndDate &&
        !['archive','cancelled'].includes(p.status))
      .map(p => {
        const endDate = new Date(p.contractEndDate!);
        const month   = endDate.getMonth();
        const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / 86400000);
        let payStatus: 'paid'|'overdue'|'upcoming'|'pending' = 'pending';
        if ((p.paidSum ?? 0) >= (p.contractSum ?? 1))   payStatus = 'paid';
        else if (daysLeft < 0)                           payStatus = 'overdue';
        else if (daysLeft <= 7)                          payStatus = 'upcoming';
        return {
          procId:      p.id,
          procNum:     p.registryNumber,
          title:       p.title,
          supplier:    p.supplierName ?? '—',
          contractSum: p.contractSum!,
          paidSum:     p.paidSum ?? 0,
          remaining:   (p.contractSum!) - (p.paidSum ?? 0),
          dueDate:     p.contractEndDate!,
          month,
          payStatus,
          daysLeft,
          kbk:         p.kbk ?? '—',
          responsibleName: p.responsibleName,
          status:      p.status,
        };
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [procurements]);

  const filtered = monthFilter !== null
    ? payments.filter(p => p.month === monthFilter)
    : payments;

  // Суммы по месяцам для графика
  const byMonth = useMemo(() => {
    return MONTHS.map((m, i) => {
      const month = payments.filter(p => p.month === i);
      return {
        month: m,
        idx: i,
        total:   month.reduce((s, p) => s + p.contractSum, 0),
        paid:    month.reduce((s, p) => s + p.paidSum, 0),
        pending: month.reduce((s, p) => s + p.remaining, 0),
        count:   month.length,
        overdue: month.filter(p => p.payStatus === 'overdue').length,
      };
    }).filter(m => m.total > 0);
  }, [payments]);

  const totalPending  = payments.reduce((s, p) => s + p.remaining, 0);
  const totalPaid     = payments.reduce((s, p) => s + p.paidSum, 0);
  const totalOverdue  = payments.filter(p => p.payStatus === 'overdue').length;
  const totalUpcoming = payments.filter(p => p.payStatus === 'upcoming').length;

  const maxSum = Math.max(...byMonth.map(m => m.total), 1);

  const ST = {
    paid:     { label:'Оплачено',            cls:'bg-green-50 text-green-700 border-green-300',  icon:<CheckCircle size={11}/> },
    overdue:  { label:'Просрочено',          cls:'bg-red-50 text-red-700 border-red-300',        icon:<AlertTriangle size={11}/> },
    upcoming: { label:'Срок через 7 дней',   cls:'bg-orange-50 text-orange-700 border-orange-300', icon:<Clock size={11}/> },
    pending:  { label:'Ожидает оплаты',      cls:'bg-blue-50 text-blue-700 border-blue-300',    icon:<CreditCard size={11}/> },
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'График платежей' }]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">График платежей по договорам</h1>
            <p className="text-xs text-gray-500">
              Формируется автоматически из реестра закупок · 2026 год
            </p>
          </div>
          <div className="flex gap-1">
            {['list','calendar'].map(m => (
              <button key={m} onClick={() => setViewMode(m as 'list'|'calendar')}
                className={`gov-btn gov-btn-sm ${viewMode === m ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
                {m === 'list' ? '☰ Список' : '📅 По месяцам'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { label:'К оплате (руб.)',     val:formatCurrency(totalPending),  cls:'text-blue-700',   icon:<CreditCard size={14}/> },
            { label:'Оплачено (руб.)',     val:formatCurrency(totalPaid),     cls:'text-green-700',  icon:<CheckCircle size={14}/> },
            { label:'Просрочено',         val:`${totalOverdue} дог.`,        cls:totalOverdue>0?'text-red-600':'text-gray-400', icon:<AlertTriangle size={14}/> },
            { label:'Срок через 7 дней',  val:`${totalUpcoming} дог.`,       cls:totalUpcoming>0?'text-orange-600':'text-gray-400', icon:<Clock size={14}/> },
          ].map(s => (
            <div key={s.label} className="gov-card p-3 flex items-start gap-2">
              <div className={`mt-0.5 ${s.cls}`}>{s.icon}</div>
              <div>
                <div className={`text-lg font-bold leading-tight ${s.cls}`}>{s.val}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {viewMode === 'calendar' ? (
          /* Вид по месяцам */
          <div className="space-y-3">
            {byMonth.map(m => (
              <div key={m.idx} className={`gov-card overflow-hidden ${monthFilter === m.idx ? 'border-blue-400 border-2' : ''}`}>
                <button
                  onClick={() => setMonthFilter(monthFilter === m.idx ? null : m.idx)}
                  className="gov-section-title w-full flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span>{m.month} 2026</span>
                    <span className="text-gray-400 font-normal">{m.count} договора</span>
                    {m.overdue > 0 && (
                      <span className="gov-badge bg-red-50 text-red-600 border-red-200">{m.overdue} просрочено</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      Оплачено {formatCurrency(m.paid)} / {formatCurrency(m.total)}
                    </span>
                    <div className="w-24 gov-progress">
                      <div className="gov-progress-bar"
                        style={{ width: `${m.total>0 ? m.paid/m.total*100 : 0}%`, background:'#16a34a' }}/>
                    </div>
                  </div>
                </button>

                {/* Столбиковая диаграмма */}
                <div className="px-4 py-2">
                  <div className="flex items-end gap-1 h-10">
                    <div className="flex-1 bg-green-400 rounded-t transition-all"
                      style={{ height: `${m.total > 0 ? (m.paid / maxSum) * 40 : 0}px` }}
                      title={`Оплачено: ${formatCurrency(m.paid)}`}/>
                    <div className="flex-1 bg-blue-400 rounded-t transition-all"
                      style={{ height: `${m.total > 0 ? (m.pending / maxSum) * 40 : 0}px` }}
                      title={`К оплате: ${formatCurrency(m.pending)}`}/>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-green-600">■ Оплачено: {formatCurrency(m.paid)}</span>
                    <span className="text-xs text-blue-600">■ К оплате: {formatCurrency(m.pending)}</span>
                  </div>
                </div>
              </div>
            ))}

            {monthFilter !== null && (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">📋 {MONTHS[monthFilter]} 2026 — детали</div>
                <table className="gov-table">
                  <thead><tr><th>Закупка</th><th>Поставщик</th><th>Сумма</th><th>Оплачено</th><th>К оплате</th><th>Срок</th><th></th></tr></thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.procId}>
                        <td>
                          <div className="text-xs font-mono font-bold text-blue-600">{p.procNum}</div>
                          <div className="text-xs text-gray-600 max-w-48 truncate">{p.title}</div>
                        </td>
                        <td className="text-xs">{p.supplier}</td>
                        <td className="text-xs font-bold text-right">{formatCurrency(p.contractSum)}</td>
                        <td className="text-xs text-green-700 text-right">{formatCurrency(p.paidSum)}</td>
                        <td className="text-xs font-bold text-blue-700 text-right">{formatCurrency(p.remaining)}</td>
                        <td><span className={`gov-badge flex items-center gap-1 ${ST[p.payStatus].cls}`}>{ST[p.payStatus].icon} {formatDate(p.dueDate)}</span></td>
                        <td><Link href={`/zakupki/${p.procId}`} className="gov-btn gov-btn-ghost gov-btn-sm">→</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Список */
          <div className="gov-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Закупка</th>
                    <th>Поставщик</th>
                    <th>КБК</th>
                    <th className="text-right">Сумма дог.</th>
                    <th className="text-right">Оплачено</th>
                    <th className="text-right">Остаток</th>
                    <th>Срок оплаты</th>
                    <th>Статус</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.procId} className={p.payStatus === 'overdue' ? 'bg-red-50' : p.payStatus === 'upcoming' ? 'bg-orange-50' : ''}>
                      <td>
                        <div className="text-xs font-mono font-bold text-blue-600">{p.procNum}</div>
                        <div className="text-xs text-gray-600 max-w-40 truncate">{p.title}</div>
                        <div className="text-xs text-gray-400">{p.responsibleName}</div>
                      </td>
                      <td className="text-xs">{p.supplier}</td>
                      <td className="text-xs font-mono text-gray-500">{p.kbk}</td>
                      <td className="text-xs font-bold text-right">{formatCurrency(p.contractSum)}</td>
                      <td className="text-right">
                        <div className="text-xs font-bold text-green-700">{formatCurrency(p.paidSum)}</div>
                        <div className="w-16 gov-progress mt-0.5 ml-auto">
                          <div className="gov-progress-bar"
                            style={{ width: `${p.contractSum > 0 ? p.paidSum/p.contractSum*100 : 0}%`, background:'#16a34a' }}/>
                        </div>
                      </td>
                      <td className="text-xs font-bold text-right text-blue-700">{formatCurrency(p.remaining)}</td>
                      <td>
                        <div className="text-xs font-bold">{formatDate(p.dueDate)}</div>
                        {p.payStatus !== 'paid' && (
                          <div className={`text-xs ${p.daysLeft < 0 ? 'text-red-600 font-bold' : p.daysLeft <= 7 ? 'text-orange-600' : 'text-gray-400'}`}>
                            {p.daysLeft < 0 ? `Просрочка ${Math.abs(p.daysLeft)} дн.` : `через ${p.daysLeft} дн.`}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`gov-badge flex items-center gap-1 ${ST[p.payStatus].cls}`}>
                          {ST[p.payStatus].icon} {ST[p.payStatus].label}
                        </span>
                      </td>
                      <td>
                        <Link href={`/zakupki/${p.procId}`} className="gov-btn gov-btn-ghost gov-btn-sm">→</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={3} className="text-xs text-gray-700">Итого</td>
                    <td className="text-xs text-right">{formatCurrency(payments.reduce((s,p)=>s+p.contractSum,0))}</td>
                    <td className="text-xs text-right text-green-700">{formatCurrency(totalPaid)}</td>
                    <td className="text-xs text-right text-blue-700">{formatCurrency(totalPending)}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
