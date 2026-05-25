'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CHECKS = [
  { id:'ch1', num:'ПРВ-2026-001', type:'Плановая', subject:'Проверка правомерности закупок МТО (I кв. 2026)', dept:'Отдел МТО', inspector:'Отдел правового обеспечения', dateFrom:'2026-04-10', dateTo:'2026-04-15', status:'completed', result:'Нарушений не выявлено. Все закупки соответствуют требованиям 44-ФЗ.', procIds:['p001','p004','p006'], findings:0 },
  { id:'ch2', num:'ПРВ-2026-002', type:'Внеплановая', subject:'Проверка документации по закупке серверного оборудования', dept:'ИТ-отдел', inspector:'Контрактная служба', dateFrom:'2026-05-05', dateTo:'2026-05-06', status:'completed', result:'Выявлено 1 замечание: в первоначальной редакции отсутствовало обоснование НМЦК. Замечание устранено.', procIds:['p002'], findings:1 },
  { id:'ch3', num:'ПРВ-2026-003', type:'Плановая', subject:'Проверка соблюдения сроков размещения в ЕИС (II кв. 2026)', dept:'Все подразделения', inspector:'Контрактный управляющий', dateFrom:'2026-07-01', dateTo:'2026-07-03', status:'planned', result:null, procIds:[], findings:0 },
  { id:'ch4', num:'ПРВ-2026-004', type:'Внеплановая', subject:'Проверка исполнения договора Microsoft 365 — своевременность отчётности', dept:'ИТ-отдел', inspector:'ФЭО + Юридический', dateFrom:'2026-05-15', dateTo:'2026-05-16', status:'in_progress', result:null, procIds:['p009'], findings:0 },
];

const ST: Record<string,{label:string;cls:string;icon:React.ReactNode}> = {
  planned:     {label:'Запланирована', cls:'bg-blue-50 text-blue-700 border-blue-300',   icon:<Clock size={11}/>},
  in_progress: {label:'Проводится',   cls:'bg-yellow-50 text-yellow-700 border-yellow-300', icon:<Shield size={11}/>},
  completed:   {label:'Завершена',    cls:'bg-green-50 text-green-700 border-green-300', icon:<CheckCircle size={11}/>},
};

export default function ProverkiPage() {
  const [sf, setSf]           = useState('all');
  const [selected, setSelected] = useState<string|null>('ch2');
  const filtered = CHECKS.filter(c => sf==='all' || c.status===sf);
  const sel = CHECKS.find(c => c.id === selected);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Проверки и контроль'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Проверки и внутренний контроль</h1>
            <p className="text-xs text-gray-500">Плановые и внеплановые проверки закупочной деятельности</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            {label:'Всего проверок', val:CHECKS.length, cls:'text-gray-700'},
            {label:'Завершено',      val:CHECKS.filter(c=>c.status==='completed').length, cls:'text-green-700'},
            {label:'Замечаний',      val:CHECKS.reduce((s,c)=>s+c.findings,0), cls:CHECKS.reduce((s,c)=>s+c.findings,0)>0?'text-red-600':'text-green-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-2">
            <div className="gov-card p-1.5 flex gap-1 flex-wrap">
              {['all','in_progress','planned','completed'].map(s=>(
                <button key={s} onClick={()=>setSf(s)} className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
                  {{all:'Все',in_progress:'Проводится',planned:'Запланировано',completed:'Завершены'}[s as 'all']}
                </button>
              ))}
            </div>

            {filtered.map(c=>(
              <div key={c.id} onClick={()=>setSelected(c.id===selected?null:c.id)}
                className={`gov-card p-3 cursor-pointer hover:shadow-sm transition-all ${selected===c.id?'border-blue-400 border bg-blue-50':''}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-blue-600">{c.num}</span>
                      <span className={`gov-badge flex-shrink-0 ${c.type==='Внеплановая'?'bg-orange-50 text-orange-700 border-orange-300':'bg-gray-100 text-gray-700 border-gray-300'}`}>{c.type}</span>
                      <span className={`gov-badge flex items-center gap-1 flex-shrink-0 ${ST[c.status].cls}`}>{ST[c.status].icon} {ST[c.status].label}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-800">{c.subject}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {c.dept} · Проверяющий: {c.inspector} · {formatDate(c.dateFrom)}–{formatDate(c.dateTo)}
                    </div>
                  </div>
                  {c.findings > 0 && (
                    <div className="flex items-center gap-1 text-xs text-red-600 font-bold flex-shrink-0">
                      <AlertTriangle size={12}/> {c.findings} замеч.
                    </div>
                  )}
                </div>
                {c.result && (
                  <div className={`text-xs p-2 rounded mt-1 ${c.findings>0?'bg-orange-50 text-orange-800':'bg-green-50 text-green-800'}`}>
                    {c.result}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="sticky top-4">
            {sel ? (
              <div className="gov-card overflow-hidden">
                <div className="gov-section-title">🔍 Детали проверки</div>
                <div className="p-3 space-y-3">
                  <div><div className="text-xs text-gray-500">Номер</div><div className="text-xs font-bold text-blue-600">{sel.num}</div></div>
                  <div><div className="text-xs text-gray-500">Тема</div><div className="text-xs font-bold">{sel.subject}</div></div>
                  <div><div className="text-xs text-gray-500">Подразделение</div><div className="text-xs font-bold">{sel.dept}</div></div>
                  <div><div className="text-xs text-gray-500">Проверяющий</div><div className="text-xs font-bold">{sel.inspector}</div></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><div className="text-xs text-gray-500">Начало</div><div className="text-xs font-bold">{formatDate(sel.dateFrom)}</div></div>
                    <div><div className="text-xs text-gray-500">Окончание</div><div className="text-xs font-bold">{formatDate(sel.dateTo)}</div></div>
                  </div>
                  {sel.findings > 0 && (
                    <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                      <div className="text-xs font-bold text-orange-700 mb-0.5">⚠ {sel.findings} замечание</div>
                      <div className="text-xs text-orange-700">{sel.result}</div>
                    </div>
                  )}
                  {sel.result && sel.findings === 0 && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      ✅ {sel.result}
                    </div>
                  )}
                  {sel.procIds.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-gray-700 mb-1">Проверяемые закупки:</div>
                      {sel.procIds.map(id => (
                        <Link key={id} href={`/zakupki/${id}`} className="block text-xs text-blue-600 hover:underline">→ {id}</Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="gov-card p-6 text-center text-gray-400">
                <Shield size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-xs">Выберите проверку</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
