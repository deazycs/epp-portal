'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { Plus, Search, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, TaskStatusBadge, PriorityBadge } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { exportTasksXLSX } from '@/lib/export';
import { formatDate, truncate } from '@/lib/utils';

export default function ZadachiPage() {
  const { tasks, completeTask, updateTask } = useAppStore();
  const [tab, setTab] = useState<'mine'|'all'>('mine');
  const [search, setSearch] = useState('');

  const filtered = tasks.filter(t => {
    const okTab = tab === 'mine' ? t.assigneeId === 'u1' : true;
    const okSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return okTab && okSearch;
  });

  const counts = {
    new: tasks.filter(t=>t.status==='new').length,
    in_progress: tasks.filter(t=>t.status==='in_progress').length,
    overdue: tasks.filter(t=>t.status==='overdue').length,
    done: tasks.filter(t=>t.status==='done').length,
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Задачи'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Управление задачами</h1>
            <p className="text-xs text-gray-500">Просрочено: <span className="text-red-600 font-bold">{counts.overdue}</span> · В работе: {counts.in_progress} · Новых: {counts.new}</p>
          </div>
          <button onClick={()=>exportTasksXLSX(filtered)} className="gov-btn gov-btn-ghost gov-btn-sm hidden sm:flex">📊 Excel</button>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12}/> Новая задача</button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {label:'Новые', val:counts.new, cls:'text-blue-700'},
            {label:'В работе', val:counts.in_progress, cls:'text-yellow-700'},
            {label:'Просрочены', val:counts.overdue, cls:'text-red-600'},
            {label:'Выполнены', val:counts.done, cls:'text-green-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="gov-card p-2 mb-3 flex gap-2 flex-wrap items-center">
          <div className="flex gap-1">
            {(['mine','all'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                className={`gov-btn gov-btn-sm ${tab===t?'gov-btn-primary':'gov-btn-ghost'}`}>
                {t==='mine'?'Мои задачи':'Все задачи'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="gov-input pl-7" placeholder="Поиск..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr><th>Задача</th><th>Статус</th><th>Приоритет</th><th>Исполнитель</th><th>Закупка</th><th>Срок</th><th>Действия</th></tr>
            </thead>
            <tbody>
              {filtered.map(t=>(
                <tr key={t.id}>
                  <td>
                    <div className="text-xs font-bold">{truncate(t.title,50)}</div>
                    {t.subtasks&&t.subtasks.length>0&&<div className="text-xs text-gray-400 mt-0.5">Подзадачи: {t.subtasks.filter(s=>s.done).length}/{t.subtasks.length}</div>}
                  </td>
                  <td><TaskStatusBadge status={t.status}/></td>
                  <td><PriorityBadge priority={t.priority}/></td>
                  <td className="text-xs font-bold">{t.assigneeName}</td>
                  <td>{t.procurementId?<a href={`/zakupki/${t.procurementId}`} className="text-xs text-blue-600 hover:underline">→</a>:<span className="text-xs text-gray-400">—</span>}</td>
                  <td className={`text-xs ${t.status==='overdue'?'text-red-600 font-bold':'text-gray-600'}`}>{t.dueDate?formatDate(t.dueDate):'—'}</td>
                  <td>
                    {t.status !== 'done' && (
                      <button onClick={()=>completeTask(t.id)}
                        className="gov-btn gov-btn-success gov-btn-sm py-0 text-xs">
                        <CheckCircle size={11}/> Выполнить
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden space-y-2">
          {filtered.map(t=>(
            <div key={t.id} className="gov-card p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800">{truncate(t.title,55)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{t.assigneeName} · {t.dueDate?`до ${formatDate(t.dueDate)}`:'без срока'}</div>
                </div>
                <TaskStatusBadge status={t.status}/>
              </div>
              <div className="flex items-center justify-between">
                <PriorityBadge priority={t.priority}/>
                {t.status!=='done'&&(
                  <button onClick={()=>completeTask(t.id)} className="gov-btn gov-btn-success gov-btn-sm py-0 text-xs">
                    ✓ Выполнить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
