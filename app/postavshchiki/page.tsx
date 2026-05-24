'use client';

import { useState } from 'react';
import { Search, Plus, Star, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { MOCK_SUPPLIERS } from '@/mock/data/users';
import { formatCurrency, formatDate, truncate } from '@/lib/utils';

export default function PostavshchikiPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MOCK_SUPPLIERS.filter(s => {
    const okSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.inn.includes(search);
    const okStatus = statusFilter === 'all' || s.status === statusFilter;
    return okSearch && okStatus;
  });

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Поставщики' }]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр поставщиков</h1>
            <p className="text-xs text-gray-500">Зарегистрировано: {MOCK_SUPPLIERS.length}</p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12} /> Добавить поставщика</button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="gov-card p-2 text-center">
            <div className="text-xl font-bold text-gray-700">{MOCK_SUPPLIERS.length}</div>
            <div className="text-xs text-gray-400">Всего поставщиков</div>
          </div>
          <div className="gov-card p-2 text-center">
            <div className="text-xl font-bold text-green-700">{MOCK_SUPPLIERS.filter(s => s.isSmallBusiness).length}</div>
            <div className="text-xs text-gray-400">МСП</div>
          </div>
          <div className="gov-card p-2 text-center">
            <div className="text-xl font-bold text-blue-700">{formatCurrency(MOCK_SUPPLIERS.reduce((s, p) => s + p.totalSum, 0))}</div>
            <div className="text-xs text-gray-400">Сумма всех договоров</div>
          </div>
        </div>

        <div className="gov-card p-2 mb-3 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="gov-input pl-7" placeholder="Поиск по наименованию, ИНН..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1">
            {['all', 'active', 'v_rnp', 'priostanovlen'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`gov-btn gov-btn-sm ${statusFilter === s ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
                {{ all:'Все', active:'Активные', blacklisted:'Черный список', suspended:'Заблокированы' }[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>ИНН / ОГРН</th>
                  <th>Тип</th>
                  <th>МСП</th>
                  <th>Статус</th>
                  <th>Рейтинг</th>
                  <th>Договоров</th>
                  <th className="text-right">Сумма договоров</th>
                  <th>Контактное лицо</th>
                  <th>Последний договор</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div className="text-xs font-bold text-blue-600">{s.name}</div>
                      <div className="text-xs text-gray-400">{truncate(s.legalAddress, 40)}</div>
                    </td>
                    <td>
                      <div className="text-xs font-mono font-bold">{s.inn}</div>
                      {s.ogrn && <div className="text-xs font-mono text-gray-400">{s.ogrn}</div>}
                    </td>
                    <td>
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border">
                        {{ legal:'Юр. лицо', individual:'ИП', sp:'Самозанятый' }[s.category]}
                      </span>
                    </td>
                    <td className="text-center">
                      {s.isSmallBusiness
                        ? <span className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded">МСП</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td>
                      <span className={`gov-badge ${
                        s.status === 'active' ? 'bg-green-50 text-green-700 border-green-300' :
                        s.status === 'blacklisted' ? 'bg-red-50 text-red-700 border-red-300' :
                        'bg-yellow-50 text-yellow-700 border-yellow-300'
                      }`}>
                        {{ active:'Активен', blacklisted:'Чёрный список', suspended:'Заблокирован' }[s.status]}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold">{s.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="text-center text-xs font-bold">{s.totalContracts}</td>
                    <td className="text-right text-xs font-bold text-blue-700">{formatCurrency(s.totalSum)}</td>
                    <td className="text-xs">{s.contactPerson}</td>
                    <td className="text-xs text-gray-500">{s.lastContractAt ? formatDate(s.lastContractAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
