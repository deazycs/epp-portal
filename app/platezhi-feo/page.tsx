'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, Clock, AlertTriangle, Send, Building2 } from 'lucide-react';
import Link from 'next/link';
import type { ProcurementStatus } from '@/types';

export const dynamic = 'force-dynamic';

// Цепочка оплаты по шагам
const PAYMENT_CHAIN = [
  {
    status: 'payment_docs' as ProcurementStatus,
    label: 'Документы в ФЭО',
    actor: 'МТО → ФЭО',
    desc: 'МТО передало подписанные документы: УПД/ТОРГ-12, акт приёмки, счёт-фактуру',
    color: 'border-amber-400 bg-amber-50',
    badge: 'bg-amber-500',
    next: 'payment_sufd' as ProcurementStatus,
    nextLabel: 'Отправить в Казначейство (СУФД)',
    nextActor: 'Пикинер О.В. · ФЭО',
  },
  {
    status: 'payment_sufd' as ProcurementStatus,
    label: 'Казначейство СУФД',
    actor: 'ФЭО → Казначейство',
    desc: 'Платёжное поручение направлено в Казначейство через СУФД. Ожидаем исполнения.',
    color: 'border-orange-400 bg-orange-50',
    badge: 'bg-orange-500',
    next: 'payment_done' as ProcurementStatus,
    nextLabel: 'Оплата подтверждена в 1С',
    nextActor: 'Пикинер О.В. · ФЭО',
  },
  {
    status: 'payment_done' as ProcurementStatus,
    label: 'Оплачено (1С)',
    actor: 'Казначейство → 1С',
    desc: 'Казначейство исполнило платёж. Оплата отражена в 1С. Контракт исполнен.',
    color: 'border-green-500 bg-green-50',
    badge: 'bg-green-600',
    next: 'eis_reporting' as ProcurementStatus,
    nextLabel: 'Разместить отчёт в ЕИС',
    nextActor: 'МТО · Митусов / Швецов',
  },
];

export default function PlatezhiFeoPage() {
  const { procurements, changeStatus } = useAppStore();

  // Закупки в любом из статусов оплаты
  const inPayment = useMemo(() =>
    procurements.filter(p =>
      ['payment', 'payment_docs', 'payment_sufd', 'payment_done'].includes(p.status)
    ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [procurements]
  );

  const [selected, setSelected] = useState<string | null>(inPayment[0]?.id ?? null);
  const sel = procurements.find(p => p.id === selected);

  const currentStep = PAYMENT_CHAIN.find(s => s.status === sel?.status);

  const advance = (procId: string, nextStatus: ProcurementStatus) => {
    changeStatus(procId, nextStatus, 'u_pik', 'Пикинер О.В.');
  };

  const getStepIcon = (status: string) => {
    if (status === 'payment_done') return <CheckCircle size={14} className="text-green-600"/>;
    if (status === 'payment_sufd') return <Send size={14} className="text-orange-500"/>;
    return <Clock size={14} className="text-amber-500"/>;
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[
          {label: 'Рабочий стол', href: '/dashboard'},
          {label: 'Платежи', href: '/platezhi'},
          {label: 'Оплата через СУФД'},
        ]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Оплата: ФЭО → Казначейство → 1С</h1>
            <p className="text-xs text-gray-500">
              Пикинер О.В. · Финансово-экономический отдел · СУФД
            </p>
          </div>
        </div>

        {/* Цепочка оплаты — визуальная схема */}
        <div className="gov-card p-4 mb-4">
          <div className="text-xs font-bold text-gray-700 mb-3">Процесс оплаты по контракту:</div>
          <div className="flex items-center gap-0 flex-wrap">
            {[
              { label: '1. Приёмка товара', sublabel: 'МТО подписывает акт', done: true, color: 'bg-blue-600' },
              { label: '2. Документы в ФЭО', sublabel: 'МТО передаёт УПД, акт, счёт', done: false, color: 'bg-amber-500' },
              { label: '3. СУФД Казначейство', sublabel: 'ФЭО формирует платёж', done: false, color: 'bg-orange-500' },
              { label: '4. Оплата в 1С', sublabel: 'Казначейство исполняет', done: false, color: 'bg-green-600' },
              { label: '5. Отчёт в ЕИС', sublabel: 'МТО размещает отчёт', done: false, color: 'bg-sky-600' },
            ].map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="text-center min-w-24">
                  <div className={`w-6 h-6 rounded-full ${step.color} text-white text-xs flex items-center justify-center mx-auto mb-1 font-bold`}>
                    {i + 1}
                  </div>
                  <div className="text-xs font-bold text-gray-700 leading-tight">{step.label.replace(/^\d+\. /, '')}</div>
                  <div className="text-xs text-gray-400 leading-tight">{step.sublabel}</div>
                </div>
                {i < 4 && <div className="w-6 h-0.5 bg-gray-200 flex-shrink-0 mb-4"/>}
              </div>
            ))}
          </div>
        </div>

        {inPayment.length === 0 ? (
          <div className="gov-card p-10 text-center text-gray-400">
            <Building2 size={36} className="mx-auto mb-3 opacity-20"/>
            <p className="text-sm">Нет закупок на этапе оплаты</p>
            <p className="text-xs mt-1">Они появятся после принятия товара приёмочной комиссией</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Список */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Ожидают оплаты ({inPayment.length})
              </div>
              {inPayment.map(p => {
                const step = PAYMENT_CHAIN.find(s => s.status === p.status);
                return (
                  <div key={p.id}
                    onClick={() => setSelected(p.id === selected ? null : p.id)}
                    className={`gov-card p-3 cursor-pointer hover:shadow transition-all ${selected === p.id ? 'border-blue-400 border-2' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-bold text-blue-600">{p.registryNumber}</div>
                        <div className="text-xs font-bold text-gray-800 mt-0.5 line-clamp-2 leading-snug">{p.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{p.supplierName}</div>
                      </div>
                      {getStepIcon(p.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${step?.badge ?? 'bg-gray-400'} text-white`}>
                        {step?.label ?? p.status}
                      </span>
                      <span className="text-xs font-bold text-blue-700">{formatCurrency(p.contractSum ?? 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Детали и действия */}
            <div className="lg:col-span-2">
              {sel ? (
                <div className="space-y-3">
                  {/* Инфо о контракте */}
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title">💰 Оплата по контракту · {sel.registryNumber}</div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          {label: 'Поставщик',      value: sel.supplierName ?? '—'},
                          {label: 'ИНН',             value: sel.supplierInn ?? '—'},
                          {label: 'Сумма контракта', value: formatCurrency(sel.contractSum ?? 0)},
                          {label: 'КБК',             value: sel.kbk ?? '321 0412 54 4 01 90020 244'},
                          {label: 'Ответственный',   value: sel.responsibleName},
                          {label: 'Срок договора',   value: sel.contractEndDate ? formatDate(sel.contractEndDate) : '—'},
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="text-xs text-gray-400 mb-0.5">{item.label}</div>
                            <div className="text-xs font-bold text-gray-800">{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Текущий этап */}
                      {currentStep && (
                        <div className={`border-l-4 p-3 rounded-r-lg mb-4 ${currentStep.color}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {getStepIcon(currentStep.status)}
                            <span className="text-xs font-bold">{currentStep.label}</span>
                            <span className="text-xs text-gray-500">· {currentStep.actor}</span>
                          </div>
                          <p className="text-xs text-gray-600">{currentStep.desc}</p>
                        </div>
                      )}

                      {/* Шаги оплаты — временная шкала */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-gray-700 mb-2">Этапы оплаты:</div>
                        <div className="relative">
                          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"/>
                          {PAYMENT_CHAIN.map((step, i) => {
                            const isDone = PAYMENT_CHAIN.findIndex(s => s.status === sel.status) > i;
                            const isCurrent = step.status === sel.status;
                            return (
                              <div key={i} className="relative pl-8 pb-3">
                                <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 ${
                                  isDone ? 'bg-green-500 border-green-500' :
                                  isCurrent ? 'bg-blue-600 border-blue-600' :
                                  'bg-white border-gray-300'
                                }`}/>
                                <div className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : isDone ? 'text-green-700' : 'text-gray-400'}`}>
                                  {step.label}
                                </div>
                                <div className="text-xs text-gray-400">{step.actor}</div>
                              </div>
                            );
                          })}
                          {/* Финальный — ЕИС */}
                          <div className="relative pl-8 pb-1">
                            <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 ${
                              sel.status === 'eis_reporting' || sel.status === 'archive'
                                ? 'bg-green-500 border-green-500'
                                : 'bg-white border-gray-300'
                            }`}/>
                            <div className="text-xs text-gray-400">Отчётность в ЕИС</div>
                          </div>
                        </div>
                      </div>

                      {/* Кнопка перехода */}
                      {currentStep && sel.status !== 'payment_done' && (
                        <button
                          onClick={() => advance(sel.id, currentStep.next)}
                          className="gov-btn gov-btn-primary gov-btn-sm w-full justify-center">
                          → {currentStep.nextLabel}
                        </button>
                      )}
                      {sel.status === 'payment_done' && (
                        <div className="space-y-2">
                          <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                              <CheckCircle size={16}/> Контракт исполнен и оплачен
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              Казначейство исполнило платёж. Оплата отражена в 1С.
                              Контракт с {sel.supplierName} на сумму {formatCurrency(sel.contractSum ?? 0)} исполнен полностью.
                            </div>
                          </div>
                          <button
                            onClick={() => advance(sel.id, 'eis_reporting' as ProcurementStatus)}
                            className="gov-btn gov-btn-secondary gov-btn-sm w-full justify-center">
                            → Разместить отчёт в ЕИС (обязательно по ч.9 ст.94 44-ФЗ)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link href={`/zakupki/${sel.id}`}
                    className="gov-btn gov-btn-ghost gov-btn-sm w-full justify-center">
                    → Открыть карточку закупки
                  </Link>
                </div>
              ) : (
                <div className="gov-card p-12 text-center text-gray-400">
                  <Building2 size={36} className="mx-auto mb-3 opacity-20"/>
                  <p className="text-sm">Выберите закупку для обработки оплаты</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
