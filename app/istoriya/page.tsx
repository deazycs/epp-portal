'use client';

import { useAppStore } from '@/store/index';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { MOCK_HISTORY, MOCK_AUDIT_LOGS } from '@/mock/data/other';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

// Объединяем историю из обоих источников
const ALL_HISTORY = [
  ...MOCK_HISTORY.map(h => ({
    id: h.id, time: h.createdAt, user: h.userName,
    action: h.action, desc: h.description,
    old: h.oldValue, newVal: h.newValue,
    entity: h.entityType, entityId: h.entityId,
    ip: h.ipAddress,
  })),
  ...MOCK_AUDIT_LOGS.map(l => ({
    id: l.id, time: l.createdAt, user: l.userName,
    action: l.action, desc: l.description,
    old: undefined, newVal: undefined,
    entity: l.entityType ?? l.entityType, entityId: l.entityId,
    ip: l.ipAddress,
  })),
].sort((a,b) => b.time.localeCompare(a.time));

const ACTION_CLR: Record<string,string> = {
  status_change: 'bg-blue-50 text-blue-700',
  document_upload: 'bg-purple-50 text-purple-700',
  field_update: 'bg-yellow-50 text-yellow-700',
  payment_issue: 'bg-red-50 text-red-700',
  LOGIN: 'bg-gray-100 text-gray-600',
  VIEW: 'bg-gray-50 text-gray-500',
  CREATE: 'bg-green-50 text-green-700',
  APPROVE: 'bg-teal-50 text-teal-700',
  UPLOAD: 'bg-indigo-50 text-indigo-700',
  PAYMENT: 'bg-emerald-50 text-emerald-700',
  EXPORT: 'bg-orange-50 text-orange-700',
  CONFIG: 'bg-pink-50 text-pink-700',
};

export default function IstoriyaPage() {
  const { history } = useAppStore();
  const [search, setSearch] = useState('');
  const [actionF, setActionF] = useState('all');

  const actions = ['all', ...Array.from(new Set(ALL_HISTORY.map(h => h.action)))];

  const filtered = ALL_HISTORY.filter(h => {
    const okS = !search || h.desc.toLowerCase().includes(search.toLowerCase()) || h.user.toLowerCase().includes(search.toLowerCase());
    const okA = actionF === 'all' || h.action === actionF;
    return okS && okA;
  });

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'История изменений'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">История изменений</h1>
            <p className="text-xs text-gray-500">Записей: {ALL_HISTORY.length}</p>
          </div>
        </div>

        <div className="gov-card p-2 mb-3 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="gov-input pl-7" placeholder="Поиск по описанию, пользователю..."
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="gov-select w-44" value={actionF} onChange={e=>setActionF(e.target.value)}>
            {actions.map(a=><option key={a} value={a}>{a==='all'?'Все действия':a}</option>)}
          </select>
        </div>

        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Дата / Время</th>
                  <th>Пользователь</th>
                  <th>Действие</th>
                  <th>Описание</th>
                  <th>Изменение</th>
                  <th>IP-адрес</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h=>(
                  <tr key={h.id}>
                    <td className="text-xs font-mono whitespace-nowrap">{formatDateTime(h.time)}</td>
                    <td className="text-xs font-bold">{h.user}</td>
                    <td>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold font-mono ${ACTION_CLR[h.action]||'bg-gray-100 text-gray-600'}`}>
                        {h.action}
                      </span>
                    </td>
                    <td className="text-xs max-w-xs">{h.desc}</td>
                    <td className="text-xs">
                      {h.old && h.newVal && (
                        <span>
                          <span className="line-through text-red-500">{h.old}</span>
                          {' → '}
                          <span className="text-green-600 font-bold">{h.newVal}</span>
                        </span>
                      )}
                    </td>
                    <td className="text-xs font-mono text-gray-400">{h.ip||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 border-t bg-gray-50 text-xs text-gray-400">
            Показано: {filtered.length} из {ALL_HISTORY.length}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
