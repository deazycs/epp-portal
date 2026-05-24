'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { StatusBadge } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { MOCK_SUPPLIERS } from '@/mock/data/users';
import { MOCK_CONTRACTS } from '@/mock/data/other';
import { formatCurrency, formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';

export function PoiskContent() {
  const searchParams = useSearchParams();
  const { procurements, tasks } = useAppStore();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [searched, setSearched] = useState(!!searchParams.get('q'));
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); setSearched(true); }
  }, [searchParams]);

  const q = query.toLowerCase().trim();

  const procResults = searched && q ? procurements.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.registryNumber.toLowerCase().includes(q) ||
    (p.supplierName?.toLowerCase().includes(q) ?? false) ||
    (p.supplierInn?.includes(q) ?? false) ||
    p.departmentName.toLowerCase().includes(q)
  ) : [];

  const supplierResults = searched && q ? MOCK_SUPPLIERS.filter(s =>
    s.name.toLowerCase().includes(q) || s.inn.includes(q)
  ) : [];

  const contractResults = searched && q ? MOCK_CONTRACTS.filter(c =>
    c.number.toLowerCase().includes(q) ||
    c.supplierName.toLowerCase().includes(q) ||
    c.subject.toLowerCase().includes(q)
  ) : [];

  const taskResults = searched && q ? tasks.filter(t =>
    t.title.toLowerCase().includes(q) || t.assigneeName.toLowerCase().includes(q)
  ) : [];

  const total = procResults.length + supplierResults.length + contractResults.length + taskResults.length;

  const TABS = [
    { key:'all', label:`Все (${total})` },
    { key:'proc', label:`Закупки (${procResults.length})` },
    { key:'dogovory', label:`Договоры (${contractResults.length})` },
    { key:'postavshchiki', label:`Поставщики (${supplierResults.length})` },
    { key:'zadachi', label:`Задачи (${taskResults.length})` },
  ];

  const HINTS = ['Картриджи','ООО ТехноОфис','серверное оборудование','Microsoft 365'];

  return (
    <>
      {/* Строка поиска */}
      <div className="gov-card p-4 mb-4">
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="gov-input pl-8 py-2 text-sm"
              placeholder="Введите номер закупки, наименование, поставщика, ИНН..."
              value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearched(true); }} />
          </div>
          <button onClick={() => setSearched(true)} className="gov-btn gov-btn-primary">Найти</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-400">Например:</span>
          {HINTS.map(h => (
            <button key={h} onClick={() => { setQuery(h); setSearched(true); }}
              className="text-xs px-2 py-0.5 bg-gray-100 text-blue-600 rounded hover:bg-blue-50 border border-gray-200 transition-colors">
              {h}
            </button>
          ))}
        </div>
      </div>

      {searched && (
        <>
          <div className="text-xs text-gray-500 mb-3">
            По запросу <strong>«{query}»</strong> найдено: <strong>{total}</strong> результатов
          </div>

          <div className="gov-card mb-3 p-1.5 flex gap-1 flex-wrap">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`gov-btn gov-btn-sm ${activeTab === t.key ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Закупки */}
          {(activeTab === 'all' || activeTab === 'proc') && procResults.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-2">📋 Закупки ({procResults.length})</h2>
              <div className="gov-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="gov-table">
                    <thead><tr><th>№ Реестра</th><th>Наименование</th><th>Статус</th><th>Сумма</th><th>Срок</th></tr></thead>
                    <tbody>
                      {procResults.map(p => (
                        <tr key={p.id}>
                          <td><Link href={`/zakupki/${p.id}`} className="text-blue-600 hover:underline font-bold text-xs">{p.registryNumber}</Link></td>
                          <td><div className="text-xs">{truncate(p.title,50)}</div><div className="text-xs text-gray-400">{p.departmentName}</div></td>
                          <td><StatusBadge status={p.status}/></td>
                          <td className="text-xs font-bold">{formatCurrency(p.plannedSum)}</td>
                          <td className="text-xs">{formatDate(p.plannedEndDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Договоры */}
          {(activeTab === 'all' || activeTab === 'contracts') && contractResults.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-2">📄 Договоры ({contractResults.length})</h2>
              <div className="gov-card overflow-hidden">
                <table className="gov-table">
                  <thead><tr><th>№</th><th>Предмет</th><th>Поставщик</th><th>Сумма</th></tr></thead>
                  <tbody>
                    {contractResults.map(c => (
                      <tr key={c.id}>
                        <td className="text-xs font-bold text-blue-600">{c.number}</td>
                        <td className="text-xs">{truncate(c.subject,40)}</td>
                        <td className="text-xs font-bold">{c.supplierName}</td>
                        <td className="text-xs font-bold">{formatCurrency(c.totalSum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Поставщики */}
          {(activeTab === 'all' || activeTab === 'suppliers') && supplierResults.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-2">🏢 Поставщики ({supplierResults.length})</h2>
              <div className="gov-card overflow-hidden">
                <table className="gov-table">
                  <thead><tr><th>Наименование</th><th>ИНН</th><th>Договоров</th><th>Сумма</th></tr></thead>
                  <tbody>
                    {supplierResults.map(s => (
                      <tr key={s.id}>
                        <td className="text-xs font-bold">{s.name}</td>
                        <td className="text-xs font-mono">{s.inn}</td>
                        <td className="text-xs text-center">{s.totalContracts}</td>
                        <td className="text-xs font-bold">{formatCurrency(s.totalSum)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Задачи */}
          {(activeTab === 'all' || activeTab === 'tasks') && taskResults.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-gray-700 mb-2">✅ Задачи ({taskResults.length})</h2>
              <div className="gov-card overflow-hidden">
                <table className="gov-table">
                  <thead><tr><th>Задача</th><th>Исполнитель</th><th>Срок</th></tr></thead>
                  <tbody>
                    {taskResults.map(t => (
                      <tr key={t.id}>
                        <td className="text-xs">{truncate(t.title,50)}</td>
                        <td className="text-xs font-bold">{t.assigneeName}</td>
                        <td className="text-xs">{t.dueDate ? formatDate(t.dueDate) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {total === 0 && (
            <div className="gov-card p-8 text-center text-gray-400">
              <Search size={28} className="mx-auto mb-2 opacity-30"/>
              <p className="text-sm">По запросу «{query}» ничего не найдено</p>
              <p className="text-xs mt-1">Попробуйте изменить запрос</p>
            </div>
          )}
        </>
      )}

      {!searched && (
        <div className="gov-card p-8 text-center text-gray-400">
          <Search size={32} className="mx-auto mb-2 opacity-30"/>
          <p className="text-sm">Введите запрос и нажмите «Найти»</p>
          <p className="text-xs mt-1">Поиск по закупкам, договорам, поставщикам и задачам</p>
        </div>
      )}
    </>
  );
}
