'use client';
import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export default function ArkhivPage() {
  const { procurements } = useAppStore();
  const [search, setSearch] = useState('');
  const archived = procurements.filter(p =>
    p.status === 'archive' &&
    (!search || p.title.toLowerCase().includes(search.toLowerCase()) || p.registryNumber.includes(search))
  );
  const totalSum = archived.reduce((s, p) => s + (p.contractSum ?? p.plannedSum), 0);
  const totalPaid = archived.reduce((s, p) => s + (p.paidSum ?? 0), 0);

  return (
    <AppLayout>
      <div className="p-4 fade-in">
        <Breadcrumbs items={[
          { label: 'Рабочий стол', href: '/dashboard' },
          { label: 'Реестр закупок', href: '/zakupki' },
          { label: 'Архив' }
        ]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Архив закупок</h1>
            <p className="text-xs text-gray-500">Завершённых: {archived.length} · Сумма: {formatCurrency(totalSum)}</p>
          </div>
          <button className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={12} /> Экспорт</button>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Архивных записей', val: archived.length, cls: 'text-gray-700' },
            { label: 'Сумма договоров', val: formatCurrency(totalSum), cls: 'text-blue-700' },
            { label: 'Оплачено', val: formatCurrency(totalPaid), cls: 'text-green-700' },
          ].map(s => (
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-lg font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="gov-card p-2 mb-3">
          <div className="relative max-w-md">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="gov-input pl-7" placeholder="Поиск в архиве..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="gov-card overflow-hidden">
          {archived.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">Нет закупок в архиве</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>№ Реестра</th><th>Наименование</th><th>Поставщик</th>
                    <th className="text-right">Сумма договора</th><th className="text-right">Оплачено</th>
                    <th>Дата договора</th><th>Завершение</th><th>Ответственный</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {archived.map(p => (
                    <tr key={p.id} className="opacity-80">
                      <td><Link href={`/zakupki/${p.id}`} className="text-blue-600 hover:underline font-bold text-xs">{p.registryNumber}</Link></td>
                      <td className="text-xs">{truncate(p.title, 40)}</td>
                      <td className="text-xs">{p.supplierName ?? '—'}</td>
                      <td className="text-xs font-bold text-right">{p.contractSum ? formatCurrency(p.contractSum) : '—'}</td>
                      <td className="text-xs font-bold text-right text-green-700">{p.paidSum ? formatCurrency(p.paidSum) : '—'}</td>
                      <td className="text-xs">{formatDate(p.contractDate)}</td>
                      <td className="text-xs text-green-600 font-bold">{formatDate(p.actualEndDate)} ✓</td>
                      <td className="text-xs">{p.responsibleName}</td>
                      <td><Link href={`/zakupki/${p.id}`} className="gov-btn gov-btn-ghost gov-btn-sm py-0 text-xs">→</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
