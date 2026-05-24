'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { useAppStore } from '@/store/index';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { MOCK_CONTRACTS } from '@/mock/data/other';
import { formatCurrency, formatDate, truncate } from '@/lib/utils';

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик', active: 'Действует', executed: 'Исполнен',
  terminated: 'Расторгнут', expired: 'Истёк',
};
const CONTRACT_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 border-gray-300',
  active: 'bg-green-50 text-green-700 border-green-300',
  executed: 'bg-blue-50 text-blue-700 border-blue-300',
  terminated: 'bg-red-50 text-red-700 border-red-300',
  expired: 'bg-orange-50 text-orange-700 border-orange-300',
};

// Добавляем дополнительные договоры для таблицы
const EXTENDED_CONTRACTS = [
  ...MOCK_CONTRACTS,
  {
    id: 'c3', number: '089/25-МТО', procurementId: 'p004',
    procurementTitle: 'Поставка бумаги офисной А4 и А3',
    supplierId: 's2', supplierName: 'ЗАО «КанцЛайф»', supplierInn: '5010034782',
    status: 'executed' as const, subject: 'Поставка офисной бумаги',
    totalSum: 85200, paidSum: 0,
    signDate: '2025-02-01', startDate: '2025-02-01', endDate: '2025-06-30',
    actualEndDate: '2025-05-20',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    documentIds: [], payments: [], executions: [], isOverdue: true,
  },
  {
    id: 'c4', number: '156/25-ИТ', procurementId: 'p009',
    procurementTitle: 'Лицензии Microsoft Office',
    supplierId: 's5', supplierName: 'ООО «МоскваСофт»', supplierInn: '7725678901',
    status: 'executed' as const, subject: 'Поставка лицензий ПО',
    totalSum: 315000, paidSum: 315000,
    signDate: '2025-02-20', startDate: '2025-02-20', endDate: '2025-05-31',
    actualEndDate: '2025-05-10',
    departmentId: 'd4', departmentName: 'ИТ-отдел',
    responsibleId: 'u6', responsibleName: 'Никитин П.А.',
    documentIds: [], payments: [], executions: [], isOverdue: false,
  },
];

export default function KontraktyPage() {
  const { procurements } = useAppStore();
  const activeContracts = procurements.filter(p => p.contractSum && !['archive','cancelled'].includes(p.status)).length;
  const totalContractSum = procurements.reduce((s,p) => s+(p.contractSum??0), 0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = EXTENDED_CONTRACTS.filter(c => {
    const okSearch = !search ||
      c.number.toLowerCase().includes(search.toLowerCase()) ||
      c.supplierName.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const okStatus = statusFilter === 'all' || c.status === statusFilter;
    return okSearch && okStatus;
  });

  const totalSum = EXTENDED_CONTRACTS.reduce((s, c) => s + c.totalSum, 0);
  const totalPaid = EXTENDED_CONTRACTS.reduce((s, c) => s + c.paidSum, 0);

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Реестр договоров' }]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр договоров</h1>
            <p className="text-xs text-gray-500">Всего: {EXTENDED_CONTRACTS.length} · На сумму: {formatCurrency(totalSum)}</p>
          </div>
          <button className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={12} /> Экспорт</button>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Всего договоров', val: EXTENDED_CONTRACTS.length, cls: 'text-gray-700' },
            { label: 'Действующих', val: EXTENDED_CONTRACTS.filter(c => c.status === 'active').length, cls: 'text-green-700' },
            { label: 'Общая сумма', val: formatCurrency(totalSum), cls: 'text-blue-700' },
            { label: 'Оплачено', val: formatCurrency(totalPaid), cls: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-lg font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Фильтры */}
        <div className="gov-card p-2 mb-3 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="gov-input pl-7" placeholder="Поиск по номеру, поставщику..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['all', 'active', 'ispolnen', 'rastorgnut'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`gov-btn gov-btn-sm ${statusFilter === s ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
                {{ all: 'Все', active: 'Действующие', executed: 'Исполненные', terminated: 'Расторгнутые' }[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Таблица */}
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>№ Договора</th>
                  <th>Предмет договора</th>
                  <th>Статус</th>
                  <th>Поставщик</th>
                  <th className="text-right">Сумма</th>
                  <th className="text-right">Оплачено</th>
                  <th>Дата подписания</th>
                  <th>Срок исполнения</th>
                  <th>Подразделение</th>
                  <th>Ответственный</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className={c.isOverdue ? 'bg-red-50' : ''}>
                    <td>
                      <div className="text-xs font-bold text-blue-600">{c.number}</div>
                      <div className="text-xs text-gray-400">{c.subject?.slice(0, 30)}…</div>
                    </td>
                    <td className="text-xs">{truncate(c.subject, 40)}</td>
                    <td>
                      <span className={`gov-badge ${CONTRACT_STATUS_COLORS[c.status]}`}>
                        {CONTRACT_STATUS_LABELS[c.status]}
                      </span>
                      {c.isOverdue && (
                        <div className="text-xs text-red-600 font-bold mt-0.5">Просрочен платёж!</div>
                      )}
                    </td>
                    <td>
                      <div className="text-xs font-bold">{truncate(c.supplierName, 22)}</div>
                      <div className="text-xs text-gray-400">ИНН: {c.supplierInn}</div>
                    </td>
                    <td className="text-xs font-bold text-right text-gray-800">{formatCurrency(c.totalSum)}</td>
                    <td className="text-xs text-right">
                      <span className={c.paidSum === c.totalSum ? 'text-green-700 font-bold' : 'text-orange-600 font-bold'}>
                        {formatCurrency(c.paidSum)}
                      </span>
                    </td>
                    <td className="text-xs">{formatDate(c.signDate)}</td>
                    <td className="text-xs">
                      {c.actualEndDate
                        ? <span className="text-green-600">{formatDate(c.actualEndDate)} ✓</span>
                        : <span className={new Date(c.endDate) < new Date() ? 'text-red-600 font-bold' : ''}>
                            {formatDate(c.endDate)}
                          </span>
                      }
                    </td>
                    <td className="text-xs text-gray-500">{c.departmentName}</td>
                    <td className="text-xs font-bold">{c.responsibleName}</td>
                    <td>
                      <a href={`/zakupki/${c.procurementId}`} className="gov-btn gov-btn-ghost gov-btn-sm py-0">
                        <Eye size={11} />
                      </a>
                    </td>
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
