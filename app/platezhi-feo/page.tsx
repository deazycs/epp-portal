'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle, Clock, FileText, Upload, Building2 } from 'lucide-react';
import Link from 'next/link';
import type { ProcurementStatus } from '@/types';

export const dynamic = 'force-dynamic';

export default function PlatezhiFeoPage() {
  const { procurements, changeStatus } = useAppStore();

  const inPayment = useMemo(() =>
    procurements.filter(p =>
      ['payment', 'payment_docs', 'payment_done'].includes(p.status)
    ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [procurements]
  );

  const [selected, setSelected] = useState<string | null>(inPayment[0]?.id ?? null);
  const sel = procurements.find(p => p.id === selected);

  const advance = (procId: string, status: ProcurementStatus) => {
    changeStatus(procId, status, 'u_pik', 'Пикинер О.В.');
  };

  const stepLabel = (status: string) => {
    if (status === 'payment_docs') return { label: 'Документы в ФЭО', cls: 'bg-amber-50 text-amber-700 border-amber-300', icon: <Clock size={11}/> };
    if (status === 'payment_done') return { label: 'Оплачено', cls: 'bg-green-50 text-green-700 border-green-300', icon: <CheckCircle size={11}/> };
    return { label: 'К оплате', cls: 'bg-blue-50 text-blue-700 border-blue-300', icon: <FileText size={11}/> };
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[
          { label: 'Рабочий стол', href: '/dashboard' },
          { label: 'Платежи', href: '/platezhi' },
          { label: 'Оплата через ФЭО' },
        ]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Оплата — передача документов в ФЭО</h1>
            <p className="text-xs text-gray-500">
              Пикинер О.В. · Финансово-экономический отдел
            </p>
          </div>
        </div>

        {/* Схема процесса */}
        <div className="gov-card p-4 mb-4">
          <div className="text-xs font-bold text-gray-700 mb-3">Процесс оплаты (малый объём — бумажный документооборот):</div>
          <div className="flex items-start gap-0 flex-wrap">
            {[
              { num: '1', label: 'Приёмка товара', sub: 'МТО подписывает документы\nпоставщика на бумаге', color: 'bg-blue-600' },
              { num: '2', label: 'Сканирование', sub: 'МТО сканирует: накладную\nакт, счёт-фактуру', color: 'bg-indigo-500' },
              { num: '3', label: 'Загрузка в ЕПП', sub: 'Сканы загружаются\nв карточку закупки', color: 'bg-purple-500' },
              { num: '4', label: 'Документы в ФЭО', sub: 'МТО передаёт оригиналы\nПикинер О.В.', color: 'bg-amber-500' },
              { num: '5', label: 'ФЭО оплачивает', sub: 'ФЭО проводит оплату\nконтракт исполнен', color: 'bg-green-600' },
            ].map((step, i) => (
              <div key={i} className="flex items-start">
                <div className="text-center w-24">
                  <div className={`w-7 h-7 rounded-full ${step.color} text-white text-xs flex items-center justify-center mx-auto mb-1 font-bold`}>
                    {step.num}
                  </div>
                  <div className="text-xs font-bold text-gray-700 leading-tight">{step.label}</div>
                  <div className="text-xs text-gray-400 leading-snug whitespace-pre-line mt-0.5">{step.sub}</div>
                </div>
                {i < 4 && (
                  <div className="flex items-center pb-6 mx-1">
                    <div className="w-4 h-0.5 bg-gray-300"/>
                    <div className="text-gray-300 text-xs">›</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {inPayment.length === 0 ? (
          <div className="gov-card p-10 text-center text-gray-400">
            <Building2 size={36} className="mx-auto mb-3 opacity-20"/>
            <p className="text-sm">Нет закупок на этапе оплаты</p>
            <p className="text-xs mt-1">Появятся после принятия товара и передачи документов в ФЭО</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Список */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Ожидают оплаты ({inPayment.length})
              </div>
              {inPayment.map(p => {
                const st = stepLabel(p.status);
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
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`gov-badge flex items-center gap-1 ${st.cls}`}>
                        {st.icon} {st.label}
                      </span>
                      <span className="text-xs font-bold text-blue-700">{formatCurrency(p.contractSum ?? 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Детали */}
            <div className="lg:col-span-2">
              {sel ? (
                <div className="space-y-3">
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title">💰 {sel.registryNumber} · {sel.title.slice(0, 50)}</div>
                    <div className="p-4">
                      {/* Реквизиты */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Поставщик',      value: sel.supplierName ?? '—' },
                          { label: 'ИНН поставщика', value: sel.supplierInn ?? '—' },
                          { label: 'Сумма контракта',value: formatCurrency(sel.contractSum ?? 0) },
                          { label: 'КБК',             value: sel.kbk ?? '321 0412 54 4 01 90020 244' },
                          { label: 'Ответственный',   value: sel.responsibleName },
                          { label: 'Срок договора',   value: sel.contractEndDate ? formatDate(sel.contractEndDate) : '—' },
                        ].map((item, i) => (
                          <div key={i}>
                            <div className="gov-label">{item.label}</div>
                            <div className="text-xs font-bold text-gray-800">{item.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Прогресс */}
                      <div className="mb-4">
                        <div className="text-xs font-bold text-gray-700 mb-2">Этапы оплаты:</div>
                        <div className="relative pl-6">
                          <div className="absolute left-2 top-1 bottom-1 w-0.5 bg-gray-200"/>
                          {[
                            { status: 'execution', label: 'Товар поставлен и принят МТО', sub: 'Документы подписаны на бумаге, сканы загружены в систему' },
                            { status: 'payment_docs', label: 'Документы переданы в ФЭО', sub: 'Оригиналы: накладная, акт приёмки, счёт-фактура → Пикинер О.В.' },
                            { status: 'payment_done', label: 'Оплачено — контракт исполнен', sub: 'ФЭО провела оплату, контракт исполнен полностью' },
                          ].map((step, i) => {
                            const statuses = ['execution', 'payment', 'payment_docs', 'payment_done', 'eis_reporting', 'archive'];
                            const currentIdx = statuses.indexOf(sel.status);
                            const stepIdx = statuses.indexOf(step.status);
                            const isDone = currentIdx > stepIdx;
                            const isCurrent = step.status === sel.status ||
                              (step.status === 'payment_docs' && sel.status === 'payment');
                            return (
                              <div key={i} className="relative pb-3">
                                <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 ${
                                  isDone ? 'bg-green-500 border-green-500' :
                                  isCurrent ? 'bg-blue-600 border-blue-600' :
                                  'bg-white border-gray-300'
                                }`}/>
                                <div className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : isDone ? 'text-green-700' : 'text-gray-400'}`}>
                                  {step.label}
                                  {isCurrent && <span className="ml-2 text-blue-500">← текущий</span>}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">{step.sub}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Что нужно передать в ФЭО */}
                      {['payment', 'payment_docs'].includes(sel.status) && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                          <div className="text-xs font-bold text-amber-800 mb-2">
                            📋 Документы для передачи в ФЭО (Пикинер О.В.):
                          </div>
                          <div className="space-y-1">
                            {[
                              'Накладная (УПД или ТОРГ-12) — оригинал',
                              'Акт приёмки-передачи — оригинал с подписями',
                              'Счёт-фактура от поставщика',
                              'Счёт на оплату',
                              'Договор (если не был передан ранее)',
                            ].map((doc, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-amber-700">
                                <FileText size={11} className="flex-shrink-0"/>
                                {doc}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Кнопки действий */}
                      <div className="space-y-2">
                        {['payment', 'execution'].includes(sel.status) && (
                          <button
                            onClick={() => advance(sel.id, 'payment_docs')}
                            className="gov-btn gov-btn-primary gov-btn-sm w-full justify-center">
                            <Upload size={13}/> Документы переданы в ФЭО
                          </button>
                        )}

                        {sel.status === 'payment_docs' && (
                          <button
                            onClick={() => advance(sel.id, 'payment_done')}
                            className="gov-btn gov-btn-success gov-btn-sm w-full justify-center">
                            <CheckCircle size={13}/> ФЭО оплатила — контракт исполнен
                          </button>
                        )}

                        {sel.status === 'payment_done' && (
                          <div className="space-y-2">
                            <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
                              <div className="flex items-center gap-2 text-green-800 font-bold text-xs mb-1">
                                <CheckCircle size={14}/> Контракт исполнен и оплачен
                              </div>
                              <div className="text-xs text-green-700">
                                ФЭО провела оплату по контракту с {sel.supplierName} на сумму{' '}
                                {formatCurrency(sel.contractSum ?? 0)}. Контракт исполнен полностью.
                              </div>
                            </div>
                            <button
                              onClick={() => changeStatus(sel.id, 'eis_reporting', 'u_shv', 'Швецов К.Е.')}
                              className="gov-btn gov-btn-secondary gov-btn-sm w-full justify-center">
                              → Разместить отчёт об исполнении в ЕИС
                            </button>
                            <div className="text-xs text-gray-400 text-center">
                              Обязательно по ч.9 ст.94 44-ФЗ — не позднее 5 рабочих дней после оплаты
                            </div>
                          </div>
                        )}
                      </div>
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
                  <p className="text-sm">Выберите закупку</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
