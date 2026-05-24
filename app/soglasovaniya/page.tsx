'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs, StatusBadge } from '@/components/ui/index';
import { MOCK_PROCUREMENTS } from '@/mock/data/procurements';
import { formatDate, formatCurrency, truncate } from '@/lib/utils';

interface ApprovalItem {
  id: string; procurementId: string; title: string; registryNumber: string;
  initiator: string; department: string; plannedSum: number; stage: number;
  totalStages: number; deadline: string; currentApprover: string;
  status: string; sentAt: string;
}

const PENDING_APPROVALS: ApprovalItem[] = [
  {
    id: 'ap1', procurementId: 'p003', title: 'Услуги по уборке служебных помещений',
    registryNumber: 'РЗ-МО-2025-00178', initiator: 'Орлова Т.В.', department: 'АХО',
    plannedSum: 340000, stage: 1, totalStages: 3, deadline: '2025-06-15',
    currentApprover: 'Смирнова Н.С.', status: 'pending', sentAt: '2025-06-05',
  },
  {
    id: 'ap2', procurementId: 'p005', title: 'Техническое обслуживание серверного оборудования',
    registryNumber: 'РЗ-МО-2025-00203', initiator: 'Никитин П.А.', department: 'ИТ-отдел',
    plannedSum: 650000, stage: 2, totalStages: 3, deadline: '2025-06-18',
    currentApprover: 'Козлов Д.М.', status: 'pending', sentAt: '2025-06-07',
  },
  {
    id: 'ap3', procurementId: 'p010', title: 'Техническое обслуживание лифтового оборудования',
    registryNumber: 'РЗ-МО-2025-00181', initiator: 'Орлова Т.В.', department: 'АХО',
    plannedSum: 185000, stage: 1, totalStages: 2, deadline: '2025-06-20',
    currentApprover: 'Смирнова Н.С.', status: 'pending', sentAt: '2025-06-08',
  },
];

const COMPLETED_APPROVALS: ApprovalItem[] = [
  {
    id: 'cp1', procurementId: 'p001', title: 'Поставка картриджей', registryNumber: 'РЗ-МО-2025-00142',
    initiator: 'Петров А.В.', department: 'Отдел МТО', plannedSum: 148500,
    stage: 3, totalStages: 3, deadline: '2025-04-10', currentApprover: 'Волкова Е.И.', status: 'approved', sentAt: '2025-04-05',
  },
  {
    id: 'cp2', procurementId: 'p002', title: 'Компьютерное оборудование', registryNumber: 'РЗ-МО-2025-00156',
    initiator: 'Никитин П.А.', department: 'ИТ-отдел', plannedSum: 892000,
    stage: 3, totalStages: 3, deadline: '2025-03-28', currentApprover: 'Волкова Е.И.', status: 'approved', sentAt: '2025-03-20',
  },
];

export default function SoglasovaniyaPage() {
  const [tab, setTab] = useState<'pending'|'completed'|'mine'>('pending');

  const displayed = tab === 'pending' ? PENDING_APPROVALS : tab === 'completed' ? COMPLETED_APPROVALS : PENDING_APPROVALS.slice(0, 1);

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'Согласования' }]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Согласования</h1>
            <p className="text-xs text-gray-500">
              Ожидают решения: <span className="text-orange-600 font-bold">{PENDING_APPROVALS.length}</span>
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="gov-card p-2 text-center border-l-4 border-l-orange-400">
            <div className="text-xl font-bold text-orange-600">{PENDING_APPROVALS.length}</div>
            <div className="text-xs text-gray-400">Ожидают согласования</div>
          </div>
          <div className="gov-card p-2 text-center border-l-4 border-l-green-400">
            <div className="text-xl font-bold text-green-600">{COMPLETED_APPROVALS.length}</div>
            <div className="text-xs text-gray-400">Согласовано</div>
          </div>
          <div className="gov-card p-2 text-center border-l-4 border-l-blue-400">
            <div className="text-xl font-bold text-blue-600">1</div>
            <div className="text-xs text-gray-400">Требует моего решения</div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="gov-card mb-3 p-2 flex gap-1">
          {[
            { key: 'pending', label: `Ожидают (${PENDING_APPROVALS.length})` },
            { key: 'mine', label: 'Мои на согласовании' },
            { key: 'completed', label: 'Завершённые' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
              className={`gov-btn gov-btn-sm ${tab === t.key ? 'gov-btn-primary' : 'gov-btn-ghost'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Список согласований */}
        <div className="space-y-2">
          {displayed.map(a => (
            <div key={a.id} className={`gov-card p-3 ${
              a.status === 'pending' ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-green-400'
            }`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`gov-badge ${
                      a.status === 'pending'
                        ? 'bg-orange-50 text-orange-700 border-orange-300'
                        : 'bg-green-50 text-green-700 border-green-300'
                    }`}>
                      {a.status === 'pending' ? '⏳ Ожидает' : '✓ Согласовано'}
                    </span>
                    <span className="text-xs text-gray-400">
                      Этап {a.stage} из {a.totalStages}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-800 mb-0.5">{a.title}</div>
                  <div className="text-xs text-gray-500">
                    {a.registryNumber} · {a.department} · Инициатор: {a.initiator}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs">
                    <span>Сумма: <strong>{formatCurrency(a.plannedSum)}</strong></span>
                    <span>Направлено: <strong>{formatDate(a.sentAt)}</strong></span>
                    <span className={new Date(a.deadline) < new Date() ? 'text-red-600 font-bold' : ''}>
                      Срок: <strong>{formatDate(a.deadline)}</strong>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Текущий согласующий: <strong>{a.currentApprover}</strong>
                  </div>

                  {/* Прогресс этапов */}
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: a.totalStages }, (_, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          i < a.stage - 1 ? 'bg-green-500 text-white' :
                          i === a.stage - 1 && a.status === 'approved' ? 'bg-green-500 text-white' :
                          i === a.stage - 1 ? 'bg-orange-400 text-white' :
                          'bg-gray-200 text-gray-400'
                        }`}>
                          {i < a.stage - 1 || (i === a.stage - 1 && a.status === 'approved') ? '✓' : i + 1}
                        </div>
                        {i < a.totalStages - 1 && (
                          <div className={`h-px w-8 ${i < a.stage - 1 ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <a href={`/zakupki/${a.procurementId}`} className="gov-btn gov-btn-ghost gov-btn-sm">
                    <Eye size={12} /> Просмотр
                  </a>
                  {a.status === 'pending' && (
                    <>
                      <button className="gov-btn gov-btn-success gov-btn-sm">
                        <CheckCircle size={12} /> Согласовать
                      </button>
                      <button className="gov-btn gov-btn-danger gov-btn-sm">
                        <XCircle size={12} /> Отклонить
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {displayed.length === 0 && (
            <div className="gov-card p-8 text-center text-gray-400">
              <CheckCircle size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Нет согласований в данной категории</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
