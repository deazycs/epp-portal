'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import { Eye, Plus } from 'lucide-react';

const CHECKS = [
  { id:'ch1', num:'ПРВ-2026-001', type:'Плановая', subject:'Проверка правомерности закупок МТО (I кв. 2026)', dept:'Отдел МТО', inspector:'Юридический отдел', dateFrom:'2026-04-10', dateTo:'2026-04-15', status:'completed', result:'Нарушений не выявлено', procIds:['p001','p004','p006'] },
  { id:'ch2', num:'ПРВ-2026-002', type:'Внеплановая', subject:'Проверка документации по закупке серверного оборудования', dept:'ИТ-отдел', inspector:'Контрактная служба', dateFrom:'2026-05-05', dateTo:'2026-05-06', status:'completed', result:'Выявлено 1 замечание: отсутствовало обоснование НМЦК в первоначальной редакции', procIds:['p002'] },
  { id:'ch3', num:'ПРВ-2026-003', type:'Плановая', subject:'Проверка соблюдения сроков размещения в ЕИС (II кв. 2026)', dept:'Все подразделения', inspector:'Контрактный управляющий', dateFrom:'2026-07-01', dateTo:'2026-07-03', status:'planned', result:null, procIds:[] },
  { id:'ch4', num:'ПРВ-2026-004', type:'Внеплановая', subject:'Проверка исполнения договора — Microsoft 365', dept:'ИТ-отдел', inspector:'Бухгалтерия', dateFrom:'2026-05-15', dateTo:'2026-05-16', status:'in_progress', result:null, procIds:['p009'] },
];

const ST: Record<string,{label:string,cls:string}> = {
  planned:     {label:'Запланирована', cls:'bg-blue-50 text-blue-700 border-blue-300'},
  in_progress: {label:'Проводится',    cls:'bg-yellow-50 text-yellow-700 border-yellow-300'},
  completed:   {label:'Завершена',     cls:'bg-green-50 text-green-700 border-green-300'},
};
const TYPE_CLR: Record<string,string> = {
  'Плановая':     'bg-gray-100 text-gray-700 border-gray-300',
  'Внеплановая':  'bg-orange-50 text-orange-700 border-orange-300',
};

export default function ProverkiPage() {
  const [sf, setSf] = useState('all');
  const filtered = CHECKS.filter(c => sf==='all' || c.status===sf);

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Проверки'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр проверок закупочной деятельности</h1>
            <p className="text-xs text-gray-500">Всего: {CHECKS.length} · Проводится: {CHECKS.filter(c=>c.status==='in_progress').length}</p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12}/> Назначить проверку</button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            {label:'Запланировано',  val:CHECKS.filter(c=>c.status==='planned').length,     cls:'text-blue-700'},
            {label:'Проводится',     val:CHECKS.filter(c=>c.status==='in_progress').length, cls:'text-yellow-700'},
            {label:'Завершено',      val:CHECKS.filter(c=>c.status==='completed').length,   cls:'text-green-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="gov-card p-2 mb-3 flex gap-1 flex-wrap">
          {['all','planned','in_progress','completed'].map(s=>(
            <button key={s} onClick={()=>setSf(s)}
              className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
              {{all:'Все',planned:'Запланированные',in_progress:'Проводятся',completed:'Завершённые'}[s as 'all']}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(c=>(
            <div key={c.id} className={`gov-card p-3 border-l-4 ${c.status==='in_progress'?'border-l-yellow-400':c.status==='completed'?'border-l-green-400':'border-l-blue-400'}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold font-mono text-gray-500">{c.num}</span>
                    <span className={`gov-badge ${TYPE_CLR[c.type]}`}>{c.type}</span>
                    <span className={`gov-badge ${ST[c.status].cls}`}>{ST[c.status].label}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 mb-0.5">{c.subject}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    Подразделение: <strong>{c.dept}</strong> · Проверяющий: <strong>{c.inspector}</strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    Период: {formatDate(c.dateFrom)} — {formatDate(c.dateTo)}
                  </div>
                  {c.result && (
                    <div className={`mt-2 text-xs p-2 rounded border ${c.result.includes('Нарушений')?'bg-green-50 border-green-200 text-green-800':'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                      <strong>Результат:</strong> {c.result}
                    </div>
                  )}
                  {c.procIds.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      <span className="text-xs text-gray-400">Закупки:</span>
                      {c.procIds.map(pid=>(
                        <a key={pid} href={`/zakupki/${pid}`} className="text-xs text-blue-600 hover:underline">
                          {pid.replace('p','РЗ-2026-00'+(parseInt(pid.replace('p',''))*14+56)%200)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="gov-btn gov-btn-ghost gov-btn-sm"><Eye size={12}/> Детали</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
