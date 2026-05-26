'use client';

import { useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, RiskBadge } from '@/components/ui/index';
import { MOCK_RISKS } from '@/mock/data/other';
import { useAppStore } from '@/store/index';
import { formatDate } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  deadline: 'Сроки', document: 'Документы', supplier: 'Поставщик',
  budget: 'Бюджет', compliance: 'Соответствие', technical: 'Технические',
};
const STATUS_LABELS: Record<string, string> = {
  open: 'Открыт', mitigated: 'Снижен', accepted: 'Принят', closed: 'Закрыт',
};
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-50 text-red-700 border-red-300',
  mitigated: 'bg-yellow-50 text-yellow-700 border-yellow-300',
  accepted: 'bg-blue-50 text-blue-700 border-blue-300',
  closed: 'bg-green-50 text-green-700 border-green-300',
};

export const dynamic = 'force-dynamic';
export default function RiskiPage() {
  const { procurements } = useAppStore();
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');

  const filtered = MOCK_RISKS.filter(r => {
    const okLevel = levelFilter === 'all' || r.level === levelFilter;
    const okStatus = statusFilter === 'all' || r.status === statusFilter;
    return okLevel && okStatus;
  });

  const counts = {
    critical: MOCK_RISKS.filter(r => r.level === 'critical').length,
    high: MOCK_RISKS.filter(r => r.level === 'high').length,
    medium: MOCK_RISKS.filter(r => r.level === 'medium').length,
    low: MOCK_RISKS.filter(r => r.level === 'low').length,
  };

  return (
    <AppLayout>
      <div className="p-4 fade-in">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Центр рисков' }]} />

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Центр рисков</h1>
            <p className="text-xs text-gray-500">
              Открытых: {MOCK_RISKS.filter(r => r.status === 'open').length} · Всего зафиксировано: {MOCK_RISKS.length}
            </p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12} /> Зафиксировать риск</button>
        </div>

        {/* KPI карточки */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Критические', val: counts.critical, border: 'border-red-300', text: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Высокие', val: counts.high, border: 'border-orange-300', text: 'text-orange-700', bg: 'bg-orange-50' },
            { label: 'Средние', val: counts.medium, border: 'border-yellow-300', text: 'text-yellow-700', bg: 'bg-yellow-50' },
            { label: 'Низкие', val: counts.low, border: 'border-green-300', text: 'text-green-700', bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className="p-2 text-center border rounded" style={{background:s.bg, borderColor:s.border}}>
              <div className="text-xl font-bold" style={{color:s.text}}>{s.val}</div>
              <div className="text-xs opacity-70" style={{color:s.text}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Фильтры */}
        <div className="gov-card p-2 mb-3 flex flex-wrap gap-2 items-center">
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'all', label: 'Все статусы' },
              { key: 'open', label: 'Открытые' },
              { key: 'mitigated', label: 'Снижены' },
              { key: 'closed', label: 'Закрыты' },
            ].map(s => (
              <button key={s.key} onClick={() => setStatusFilter(s.key)}
                className={`gov-btn gov-btn-sm ${statusFilter === s.key ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="h-4 border-l border-gray-200 hidden sm:block" />
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'all', label: 'Все уровни' },
              { key: 'critical', label: 'Критический' },
              { key: 'high', label: 'Высокий' },
              { key: 'medium', label: 'Средний' },
              { key: 'low', label: 'Низкий' },
            ].map(l => (
              <button key={l.key} onClick={() => setLevelFilter(l.key)}
                className={`gov-btn gov-btn-sm ${levelFilter === l.key ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Карточки рисков */}
        <div className="space-y-2 mb-4">
          {filtered.map(r => (
            <div key={r.id} className={`gov-card p-3 border-l-4 ${
              r.level === 'critical' ? 'border-l-red-600' :
              r.level === 'high' ? 'border-l-orange-500' :
              r.level === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
            }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className={
                      r.level === 'critical' ? 'text-red-600' :
                      r.level === 'high' ? 'text-orange-500' : 'text-yellow-500'
                    } />
                    <span className="text-sm font-bold text-gray-800">{r.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{r.description}</p>
                  {r.mitigation && (
                    <div className="text-xs p-2 bg-blue-50 border border-blue-200 rounded">
                      <strong className="text-blue-800">📋 План действий:</strong>{' '}
                      <span className="text-blue-700">{r.mitigation}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>Ответственный: <strong className="text-gray-700">{r.owner}</strong></span>
                    <span>Зафиксирован: {formatDate(r.detectedAt)}</span>

                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <RiskBadge level={r.level} />
                  <span className={`gov-badge ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded border">
                    {CATEGORY_LABELS[r.category]}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                <button className="gov-btn gov-btn-ghost gov-btn-sm">Изменить статус</button>
                <button className="gov-btn gov-btn-ghost gov-btn-sm">Добавить комментарий</button>
                {r.procurementId && (
                  <a href={`/zakupki/${r.procurementId}`} className="gov-btn gov-btn-secondary gov-btn-sm">
                    Перейти к закупке →
                  </a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="gov-card p-8 text-center text-gray-400">
              <AlertTriangle size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Рисков не найдено</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
