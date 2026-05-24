'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { MOCK_AUDIT_LOGS } from '@/mock/data/other';
import { MOCK_HISTORY } from '@/mock/data/other';
import { formatDateTime } from '@/lib/utils';

// Расширенные логи для демонстрации
const EXTENDED_LOGS = [
  ...MOCK_AUDIT_LOGS,
  { id: 'al4', userId: 'u1', userName: 'Петров А.В.', userRole: 'specialist_mto' as const, action: 'СОЗДАНИЕ', module: 'Закупки', entityId: 'p007', entityType: 'procurement', description: 'Создана закупка РЗ-МО-2025-00219', ipAddress: '10.10.1.45', userAgent: 'Mozilla/5.0', timestamp: '2025-06-09T11:00:00', result: 'success' as const },
  { id: 'al5', userId: 'u2', userName: 'Смирнова Н.С.', userRole: 'head_department' as const, action: 'СОГЛАСОВАНИЕ', module: 'Согласования', entityId: 'p001', entityType: 'procurement', description: 'Согласована закупка РЗ-МО-2025-00142', ipAddress: '10.10.1.33', userAgent: 'Mozilla/5.0', timestamp: '2025-06-08T09:15:00', result: 'success' as const },
  { id: 'al6', userId: 'u3', userName: 'Козлов Д.М.', userRole: 'contract_manager' as const, action: 'ЗАГРУЗКА', module: 'Документы', entityId: 'doc3', entityType: 'document', description: 'Загружен документ: Договор № 125/25-МТО.pdf', ipAddress: '10.10.1.12', userAgent: 'Mozilla/5.0', timestamp: '2025-06-07T14:00:00', result: 'success' as const },
  { id: 'al7', userId: 'u4', userName: 'Волкова Е.И.', userRole: 'accountant' as const, action: 'ОПЛАТА', module: 'Платежи', entityId: 'c2', entityType: 'dogovor', description: 'Проведён платёж 875 600 руб. по договору 098/25-ИТ', ipAddress: '10.10.1.22', userAgent: 'Mozilla/5.0', timestamp: '2025-06-07T13:00:00', result: 'success' as const },
  { id: 'al8', userId: 'u1', userName: 'Петров А.В.', userRole: 'specialist_mto' as const, action: 'ЭКСПОРТ', module: 'Реестр закупок', description: 'Экспорт реестра закупок в Excel', ipAddress: '10.10.1.45', userAgent: 'Mozilla/5.0', timestamp: '2025-06-06T16:00:00', result: 'success' as const },
  { id: 'al9', userId: 'u8', userName: 'Системный администратор', userRole: 'admin' as const, action: 'НАСТРОЙКА', module: 'Настройки', description: 'Изменены настройки уведомлений', ipAddress: '10.10.1.1', userAgent: 'Mozilla/5.0', timestamp: '2025-06-05T09:00:00', result: 'success' as const },
];

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'bg-blue-50 text-blue-700',
  VIEW: 'bg-gray-50 text-gray-600',
  CREATE: 'bg-green-50 text-green-700',
  APPROVE: 'bg-teal-50 text-teal-700',
  UPLOAD: 'bg-purple-50 text-purple-700',
  PAYMENT: 'bg-emerald-50 text-emerald-700',
  EXPORT: 'bg-indigo-50 text-indigo-700',
  CONFIG: 'bg-orange-50 text-orange-700',
  EDIT: 'bg-yellow-50 text-yellow-700',
};

export default function ZhurnalPage() {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = ['all', ...Array.from(new Set(EXTENDED_LOGS.map(l => l.module)))];

  const filtered = EXTENDED_LOGS
    .filter(l => {
      const okSearch = !search || l.description.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase());
      const okModule = moduleFilter === 'all' || l.module === moduleFilter;
      return okSearch && okModule;
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Журнал действий' }]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Журнал действий (Audit Log)</h1>
            <p className="text-xs text-gray-500">Записей: {EXTENDED_LOGS.length}</p>
          </div>
        </div>

        <div className="gov-card p-2 mb-3 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="gov-input pl-7" placeholder="Поиск в журнале..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="gov-select w-44" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            {modules.map(m => <option key={m} value={m}>{m === 'all' ? 'Все модули' : m}</option>)}
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
                  <th>Модуль</th>
                  <th>Описание</th>
                  <th>IP-адрес</th>
                  <th>Результат</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id}>
                    <td className="text-xs font-mono whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                    <td>
                      <div className="text-xs font-bold">{log.userName}</div>
                      <div className="text-xs text-gray-400 font-mono">{log.userId}</div>
                    </td>
                    <td>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold font-mono ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="text-xs text-gray-600 font-bold">{log.module}</td>
                    <td className="text-xs">{log.description}</td>
                    <td className="text-xs font-mono text-gray-400">{log.ipAddress}</td>
                    <td>
                      <span className={`gov-badge ${log.result === 'success' ? 'bg-green-50 text-green-700 border-green-300' : 'bg-red-50 text-red-700 border-red-300'}`}>
                        {log.result === 'success' ? '✓ OK' : '✗ Ошибка'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-400">
            Показано: {filtered.length} из {EXTENDED_LOGS.length} записей
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
