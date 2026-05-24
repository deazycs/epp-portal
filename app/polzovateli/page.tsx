'use client';

import { useState } from 'react';
import { Search, Plus, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, OnlineDot } from '@/components/ui/index';
import { MOCK_USERS } from '@/mock/data/users';
import { formatDateTime, ROLE_LABELS } from '@/lib/utils';

export default function PolzovateliPage() {
  const [search, setSearch] = useState('');
  const filtered = MOCK_USERS.filter(u =>
    !search ||
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.login.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Пользователи' }]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Пользователи системы</h1>
            <p className="text-xs text-gray-500">
              Всего: {MOCK_USERS.length} · Онлайн: {MOCK_USERS.filter(u => u.isOnline).length}
            </p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12} /> Добавить</button>
        </div>

        <div className="gov-card p-2 mb-3">
          <div className="relative max-w-xs">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="gov-input pl-7" placeholder="Поиск пользователей..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Статус</th>
                <th>ФИО / Логин</th>
                <th>Роль</th>
                <th>Должность</th>
                <th>Подразделение</th>
                <th>Email</th>
                <th>Последний вход</th>
                <th>Права</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="text-center">
                    <OnlineDot isOnline={u.isOnline} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                        {u.shortName.split(' ').map(p => p[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{u.fullName}</div>
                        <div className="text-xs font-mono text-gray-400">{u.login}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`gov-badge ${
                      u.role === 'admin' ? 'bg-red-50 text-red-700 border-red-300' :
                      u.role === 'management' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                      u.role === 'head_department' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                      'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="text-xs">{u.position}</td>
                  <td className="text-xs text-gray-600">{u.department}</td>
                  <td className="text-xs text-blue-600">{u.email}</td>
                  <td className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(u.lastLogin)}</td>
                  <td>
                    <span className="text-xs text-gray-500">
                      {u.permissions.includes('all') ? '⭐ Полные права' : `${u.permissions.length} прав`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
