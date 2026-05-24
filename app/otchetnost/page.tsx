'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { ANALYTICS_MONTHLY } from '@/mock/data/other';
import { useAppStore } from '@/store/index';
import { exportProcurementsXLSX, exportTasksXLSX } from '@/lib/export';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function OtchetnostPage() {
  const { procurements, tasks } = useAppStore();
  const active   = procurements.filter(p => !['archive','cancelled'].includes(p.status));
  const archived = procurements.filter(p => p.status === 'archive');
  const totalSum = procurements.reduce((s,p) => s+p.plannedSum, 0);
  const economy  = procurements.reduce((s,p) => s+(p.plannedSum-(p.contractSum??p.plannedSum)), 0);

  const handleExport = (type: string) => {
    if (type === 'procurements') {
      exportProcurementsXLSX(procurements);
    } else if (type === 'active') {
      exportProcurementsXLSX(active);
    } else if (type === 'tasks') {
      exportTasksXLSX(tasks);
    }
  };

  const REPORTS = [
    { id:'r1', name:'Сводный реестр закупок', desc:`Все закупки (${procurements.length} записей)`, type:'procurements', format:'CSV', ready:true },
    { id:'r2', name:'Активные закупки', desc:`Текущие закупки (${active.length} записей)`, type:'active', format:'CSV', ready:true },
    { id:'r3', name:'Реестр задач', desc:`Задачи МТО (${tasks.length} записей)`, type:'tasks', format:'CSV', ready:true },
    { id:'r4', name:'Анализ рисков', desc:'Открытые риски и планы устранения', type:'risks', format:'PDF', ready:false },
    { id:'r5', name:'Отчёт по KPI', desc:'Выполнение показателей за квартал', type:'kpi', format:'PDF', ready:false },
  ];

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Отчётность'}]}/>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-bold">Внутренняя отчётность</h1>
            <p className="text-xs text-gray-500">Выгрузки формируются из актуального реестра</p>
          </div>
        </div>

        {/* Сводка */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            {label:'Всего закупок',   val:procurements.length, cls:'text-gray-700'},
            {label:'Активных',        val:active.length,        cls:'text-blue-700'},
            {label:'Общая сумма',     val:formatCurrency(totalSum), cls:'text-gray-700'},
            {label:'Экономия',        val:formatCurrency(economy),  cls:'text-green-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-lg font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* График */}
          <div className="lg:col-span-2 gov-card">
            <div className="gov-section-title flex items-center justify-between">
              <span>📊 Динамика закупок 2026</span>
              <button onClick={()=>handleExport('procurements')}
                className="gov-btn gov-btn-ghost gov-btn-sm normal-case font-normal">
                <Download size={11}/> Экспорт
              </button>
            </div>
            <div className="p-3">
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={ANALYTICS_MONTHLY} margin={{top:4,right:8,left:-10,bottom:0}}>
                  <XAxis dataKey="month" tick={{fontSize:10}}/>
                  <YAxis tick={{fontSize:10}} tickFormatter={v=>`${(v/1000).toFixed(0)}к`}/>
                  <Tooltip formatter={(v:number)=>[formatCurrency(v),'Сумма']} contentStyle={{fontSize:11}}/>
                  <Bar dataKey="sum" fill="#003087" radius={[2,2,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ключевые показатели */}
          <div className="gov-card">
            <div className="gov-section-title">📋 Показатели</div>
            <div className="p-3 space-y-2">
              {[
                {label:'Завершено закупок', val:archived.length},
                {label:'В работе',          val:active.length},
                {label:'Задач выполнено',   val:tasks.filter(t=>t.status==='done').length},
                {label:'Задач просрочено',  val:tasks.filter(t=>t.status==='overdue').length},
                {label:'Экономия бюджета',  val:formatCurrency(economy)},
                {label:'Дата выгрузки',     val:new Date().toLocaleDateString('ru-RU')},
              ].map(k=>(
                <div key={k.label} className="flex justify-between border-b border-gray-100 pb-1.5">
                  <span className="text-xs text-gray-500">{k.label}</span>
                  <span className="text-xs font-bold text-gray-800">{k.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Готовые отчёты */}
        <div className="gov-card overflow-hidden">
          <div className="gov-section-title">📁 Выгрузки и отчёты</div>
          <table className="gov-table">
            <thead>
              <tr><th>Наименование</th><th>Содержание</th><th>Формат</th><th>Статус</th><th>Действие</th></tr>
            </thead>
            <tbody>
              {REPORTS.map(r=>(
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <FileText size={12} className="text-blue-500 flex-shrink-0"/>
                      <span className="text-xs font-bold">{r.name}</span>
                    </div>
                  </td>
                  <td className="text-xs text-gray-500">{r.desc}</td>
                  <td>
                    <span className={`gov-badge ${r.format==='PDF'?'bg-red-50 text-red-700 border-red-200':'bg-green-50 text-green-700 border-green-200'}`}>
                      {r.format}
                    </span>
                  </td>
                  <td>
                    <span className={`gov-badge ${r.ready?'bg-green-50 text-green-700 border-green-300':'bg-yellow-50 text-yellow-700 border-yellow-300'}`}>
                      {r.ready?'✓ Готов':'⏳ Формируется'}
                    </span>
                  </td>
                  <td>
                    {r.ready
                      ? <button onClick={()=>handleExport(r.type)}
                          className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={11}/> Скачать</button>
                      : <button className="gov-btn gov-btn-secondary gov-btn-sm">Запустить</button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="gov-alert gov-alert-info mt-3 text-xs">
          <span>ℹ</span>
          <span>CSV-файлы открываются в Microsoft Excel. При открытии выберите кодировку UTF-8 и разделитель «;».</span>
        </div>
      </div>
    </AppLayout>
  );
}
