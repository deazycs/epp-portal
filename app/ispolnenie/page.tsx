'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Execution {
  id: string; contractNum: string; procId: string;
  supplier: string; subject: string; stage: string;
  plannedDate: string; actualDate: string|null;
  status: string; totalSum: number; paidSum: number; completedPct: number;
  deliveryDate?: string; acceptanceDays?: number;
  deliveryAddress?: string; deliveryConditions?: string;
  items: {name:string;qty:number;done:number}[];
}

const EXECUTIONS: Execution[] = [
  { id:'e1', contractNum:'РЗ-2026-00142/Д-01', procId:'p001', supplier:'ООО «ТехноОфис»', subject:'Поставка картриджей для принтеров и МФУ', stage:'Поставка товара', plannedDate:'2026-06-30', actualDate:null, status:'in_progress', totalSum:156400, paidSum:0, completedPct:45, deliveryDate:'2026-06-30', acceptanceDays:5, deliveryAddress:'Склад МТО, каб. 102', deliveryConditions:'Партиями по заявке', items:[{name:'Картридж HP LaserJet CF217A',qty:28,done:12},{name:'Картридж Canon 725',qty:20,done:20},{name:'Тонер Samsung MLT-D111S',qty:14,done:0},{name:'Картридж Epson C13T66414A',qty:12,done:0}] },
  { id:'e2', contractNum:'РЗ-2026-00098/Д-01', procId:'p009', supplier:'ООО «МоскваСофт»', subject:'Лицензии Microsoft 365 Business Premium (50 лиц.)', stage:'Лицензии активированы', plannedDate:'2026-05-10', actualDate:'2026-04-28', status:'completed', totalSum:378000, paidSum:378000, completedPct:100, items:[{name:'Microsoft 365 Business Premium, 50 лиц.',qty:50,done:50}] },
  { id:'e3', contractNum:'РЗ-2026-00056/Д-01', procId:'p004', supplier:'ЗАО «КанцЛайф»', subject:'Поставка бумаги офисной А4/А3', stage:'Товар принят, ожидается оплата', plannedDate:'2026-04-15', actualDate:'2026-04-15', status:'awaiting_payment', totalSum:91800, paidSum:0, completedPct:95, items:[{name:'Бумага А4 Navigator 80г, 310 пач.',qty:310,done:310},{name:'Бумага А3 Navigator 80г, 28 пач.',qty:28,done:28}] },
  { id:'e4', contractNum:'РЗ-2026-00089/Д-01', procId:'p002', supplier:'ООО «СитиКомп»', subject:'Поставка серверного оборудования для ЦОД', stage:'Договор на подписании', plannedDate:'2026-07-31', actualDate:null, status:'planned', totalSum:4720000, paidSum:0, completedPct:0, items:[{name:'Сервер Dell PowerEdge R750, 4 шт.',qty:4,done:0},{name:'СХД NetApp AFF A250, 1 шт.',qty:1,done:0}] },
  { id:'e5', contractNum:'РЗ-2025-00342/Д-01', procId:'p006', supplier:'ЗАО «КанцЛайф»', subject:'Канцелярские товары (IV квартал 2025)', stage:'Исполнено и оплачено', plannedDate:'2025-12-31', actualDate:'2025-12-20', status:'completed', totalSum:54600, paidSum:54600, completedPct:100, items:[] },
];

const ST: Record<string,{label:string;cls:string;icon:React.ReactNode}> = {
  planned:         { label:'Запланировано',      cls:'bg-blue-50 text-blue-700 border-blue-300',   icon:<Clock size={11}/> },
  in_progress:     { label:'Исполняется',        cls:'bg-yellow-50 text-yellow-700 border-yellow-300', icon:<TrendingUp size={11}/> },
  awaiting_payment:{ label:'Ожидает оплаты',     cls:'bg-orange-50 text-orange-700 border-orange-300', icon:<AlertTriangle size={11}/> },
  completed:       { label:'Исполнено',          cls:'bg-green-50 text-green-700 border-green-300', icon:<CheckCircle size={11}/> },
  overdue:         { label:'Просрочено',         cls:'bg-red-50 text-red-700 border-red-300',      icon:<AlertTriangle size={11}/> },
};

export default function IspolneniePage() {
  const [sf, setSf]         = useState('all');
  const [selected, setSelected] = useState<string|null>('e1');
  const { procurements }    = useAppStore();

  const filtered = EXECUTIONS.filter(e => sf==='all' || e.status===sf);
  const sel      = EXECUTIONS.find(e => e.id === selected);
  const totalPaid = EXECUTIONS.reduce((s,e)=>s+e.paidSum,0);
  const completed = EXECUTIONS.filter(e=>e.status==='completed').length;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Исполнение договоров'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Исполнение договоров</h1>
            <p className="text-xs text-gray-500">Контроль поставок и приёмки</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            {label:'Всего договоров',  val:EXECUTIONS.length,     cls:'text-gray-700'},
            {label:'Исполнено',        val:completed,             cls:'text-green-700'},
            {label:'В исполнении',     val:EXECUTIONS.filter(e=>e.status==='in_progress').length, cls:'text-yellow-700'},
            {label:'Оплачено',         val:formatCurrency(totalPaid), cls:'text-blue-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Список */}
          <div className="lg:col-span-2 space-y-2">
            <div className="gov-card p-1.5 flex gap-1 flex-wrap">
              {['all','in_progress','awaiting_payment','planned','completed'].map(s=>(
                <button key={s} onClick={()=>setSf(s)} className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
                  {{all:'Все',in_progress:'Исполняется',awaiting_payment:'Ожидает оплаты',planned:'Запланировано',completed:'Исполнено'}[s as 'all']}
                </button>
              ))}
            </div>

            {filtered.map(e=>(
              <div key={e.id} onClick={()=>setSelected(e.id===selected?null:e.id)}
                className={`gov-card p-3 cursor-pointer hover:shadow-sm transition-all ${selected===e.id?'border-blue-400 border bg-blue-50':''}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-xs font-mono font-bold text-blue-600">{e.contractNum}</div>
                    <div className="text-xs font-bold text-gray-800 mt-0.5">{e.subject}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{e.supplier} · {e.stage}</div>
                  </div>
                  <span className={`gov-badge flex items-center gap-1 flex-shrink-0 ${ST[e.status].cls}`}>
                    {ST[e.status].icon} {ST[e.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                      <span>Исполнение</span>
                      <span className="font-bold">{e.completedPct}%</span>
                    </div>
                    <div className="gov-progress">
                      <div className={`gov-progress-bar ${e.completedPct===100?'bg-green-500':e.completedPct>0?'bg-blue-500':'bg-gray-200'}`}
                        style={{width:`${e.completedPct}%`}}/>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">{formatCurrency(e.totalSum)}</div>
                    <div className="text-xs text-gray-400">Плановый срок: {formatDate(e.plannedDate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Детали */}
          <div className="sticky top-4">
            {sel ? (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">📦 Детали исполнения</div>
                <div className="p-3 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Договор</div>
                    <div className="text-xs font-bold text-blue-600">{sel.contractNum}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Поставщик</div>
                    <div className="text-xs font-bold">{sel.supplier}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500">Сумма</div>
                      <div className="text-xs font-bold text-blue-700">{formatCurrency(sel.totalSum)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Оплачено</div>
                      <div className={`text-xs font-bold ${sel.paidSum>0?'text-green-700':'text-gray-400'}`}>{formatCurrency(sel.paidSum)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Плановый срок</div>
                      <div className="text-xs font-bold">{formatDate(sel.plannedDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Факт. дата</div>
                      <div className={`text-xs font-bold ${sel.actualDate?'text-green-700':'text-gray-400'}`}>
                        {sel.actualDate ? formatDate(sel.actualDate) : 'Не завершено'}
                      </div>
                    </div>
                  </div>

                  {sel.items.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-700 mb-1.5">Позиции:</div>
                      <div className="space-y-1.5">
                        {sel.items.map((item,i)=>(
                          <div key={i} className="text-xs">
                            <div className="flex justify-between mb-0.5">
                              <span className="text-gray-600 truncate flex-1">{item.name}</span>
                              <span className="font-bold ml-2 flex-shrink-0">{item.done}/{item.qty}</span>
                            </div>
                            <div className="gov-progress">
                              <div className={`gov-progress-bar ${item.done===item.qty?'bg-green-500':'bg-blue-500'}`}
                                style={{width:`${Math.round(item.done/item.qty*100)}%`}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sel.deliveryDate && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
                      <div className="font-bold text-blue-700">🚚 Условия поставки</div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Срок поставки</span>
                        <span className="font-bold">{formatDate(sel.deliveryDate)}</span>
                      </div>
                      {sel.acceptanceDays && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Приёмка</span>
                          <span className="font-bold">{sel.acceptanceDays} р.д.</span>
                        </div>
                      )}
                      {sel.deliveryAddress && (
                        <div>
                          <span className="text-gray-500">Адрес: </span>
                          <span>{sel.deliveryAddress}</span>
                        </div>
                      )}
                      {sel.deliveryConditions && (
                        <div>
                          <span className="text-gray-500">Порядок: </span>
                          <span>{sel.deliveryConditions}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <Link href={`/zakupki/${sel.procId}`}
                    className="gov-btn gov-btn-primary gov-btn-sm w-full justify-center">
                    → Открыть карточку закупки
                  </Link>
                </div>
              </div>
            ) : (
              <div className="gov-card p-6 text-center text-gray-400">
                <p className="text-xs">Выберите договор для просмотра деталей исполнения</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
