'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText, Clock, CheckCircle, AlertTriangle, Building2,
  CreditCard, MessageSquare, History, Shield, Download,
  Upload, Plus, Eye, Edit, Paperclip, ChevronRight, Package
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatusBadge, RiskBadge, PriorityBadge, OverdueBadge, WorkflowProgress, InfoRow, Breadcrumbs, ProgressBar } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { WORKFLOW_STATUS_ORDER, WORKFLOW_STATUS_LABELS, PROCEDURE_LABELS as PROC_LABELS } from '@/lib/constants';
import { PROCEDURE_LABELS, PROCEDURE_DESCRIPTIONS } from '@/mock/data/procurements';
import { PrintProcurementButton } from '@/components/ui/PrintButton';
import { MOCK_PROCUREMENTS, STATUS_LABELS, STATUS_COLORS } from '@/mock/data/procurements';
import { MOCK_HISTORY, MOCK_RISKS } from '@/mock/data/other';
import { formatCurrency, formatDate, formatDateTime, truncate, PROCUREMENT_TYPE_LABELS } from '@/lib/utils';
import type { Procurement, ProcurementStatus } from '@/types';


// Расширенный тип с полями которые добавлены в mock но не отражены в базовом интерфейсе
interface ProcurementExtended extends Procurement {
  procedure?: string;
  szInitiatorDept?: string;
  szDate?: string;
  nmck?: number;
  economySumTotal?: number;
  economyPct?: number;
}

const TABS = [
  { id:'info',      label:'Общие сведения',    icon:<FileText size={11}/> },
  { id:'etapy',  label:'Этапы',             icon:<ChevronRight size={11}/> },
  { id:'items',     label:'Позиции',           icon:<Package size={11}/> },
  { id:'dokumenty2', label:'Документы',         icon:<Paperclip size={11}/> },
  { id:'finansy', label:'Финансы',           icon:<CreditCard size={11}/> },
  { id:'postavshchik', label:'Поставщик',         icon:<Building2 size={11}/> },
  { id:'soglasovaniya2', label:'Согласования',      icon:<Shield size={11}/> },
  { id:'riski2', label:'Риски',             icon:<AlertTriangle size={11}/> },
  { id:'comments',  label:'Комментарии',       icon:<MessageSquare size={11}/> },
  { id:'history',   label:'История',           icon:<History size={11}/> },
];

const STATUS_ORDER = WORKFLOW_STATUS_ORDER;

const DOCS = [
  { id:'d1', name:'Техническое задание', file:'ТЗ_2026.docx', status:'approved', size:'148 КБ', date:'2026-04-05', author:'Петров А.В.' },
  { id:'d2', name:'Договор', file:'Договор.pdf', status:'approved', size:'912 КБ', date:'2026-04-18', author:'Козлов Д.М.' },
  { id:'d3', name:'Счёт-фактура', file:'СФ.pdf', status:'proverka_doc', size:'98 КБ', date:'2026-05-02', author:'Волкова Е.И.' },
];
const DOC_CLR: Record<string,string> = { draft:'bg-gray-100 text-gray-600', review:'bg-yellow-50 text-yellow-700', approved:'bg-green-50 text-green-700', rejected:'bg-red-50 text-red-700' };
const DOC_LBL: Record<string,string> = { draft:'Черновик', review:'На проверке', approved:'Утверждён', rejected:'Отклонён' };

const APPROVALS = [
  { id:'a1', stage:1, approver:'Смирнова Н.С.', role:'Нач. отдела МТО', status:'approved', date:'2026-04-08', comment:'Согласовано. Закупка плановая.' },
  { id:'a2', stage:2, approver:'Козлов Д.М.',   role:'Контрактный управляющий', status:'approved', date:'2026-04-10', comment:'ТЗ соответствует требованиям.' },
  { id:'a3', stage:3, approver:'Волкова Е.И.',  role:'Главный бухгалтер', status:'approved', date:'2026-04-12', comment:'Финансирование подтверждено.' },
];

const COMMENTS = [
  { id:'c1', author:'Смирнова Н.С.', role:'Нач. отдела', date:'2026-04-08T10:15:00', text:'Проверила ТЗ. Корректно. Прошу разместить в ЕАТ Берёзка.', internal:true },
  { id:'c2', author:'Петров А.В.',   role:'Специалист МТО', date:'2026-04-10T14:30:00', text:'Скорректировал описание. Закупка размещена в ЕАТ.', internal:true },
  { id:'c3', author:'Козлов Д.М.',   role:'Контрактный упр.', date:'2026-04-18T09:00:00', text:'Договор подписан. Оригинал передан в бухгалтерию.', internal:false },
];

export default function ZakupkaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState('info');
  const [commentText, setCommentText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name:string;size:string;date:string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles = files.map(f => ({
      name: f.name,
      size: f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} МБ` : `${Math.round(f.size/1024)} КБ`,
      date: new Date().toLocaleDateString('ru-RU'),
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };
  const [isInternal, setIsInternal] = useState(false);

  const allStoreComments = useAppStore(s => s.comments);
  const storeComments = allStoreComments.filter(c => c.procurementId === id);
  const allComments = [
    ...COMMENTS,
    ...storeComments.map(c => ({ id:c.id, author:c.author, role:c.role, date:c.createdAt, text:c.text, internal:c.internal }))
  ];

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment({ procurementId:id, author:'Петров А.В.', role:'Специалист МТО', text:commentText.trim(), internal:isInternal });
    setCommentText('');
  };
  const [statusChanging, setStatusChanging] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const { procurements, changeStatus, advanceWorkflow, history, addComment } = useAppStore();
  // Ищем закупку в store, затем в mock данных как fallback
  const rawProc = procurements.find(p => p.id === id)
    ?? MOCK_PROCUREMENTS.find(p => p.id === id)
    ?? procurements[0]
    ?? MOCK_PROCUREMENTS[0];
  const procurement = rawProc as ProcurementExtended;

  const historyItems = history.filter(h => h.entityId === id).slice(0, 10);
  const procRisks = MOCK_RISKS.filter(r => r.procurementId === id || id === 'p004');

  const currentIndex = STATUS_ORDER.indexOf(procurement.status);
  const nextStatus = currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;
  const executionPct = procurement.contractSum
    ? Math.round(((procurement.paidSum ?? 0) / procurement.contractSum) * 100) : 0;

  const handleAdvance = () => {
    setStatusChanging(true);
    setTimeout(() => {
      advanceWorkflow(id, 'u1', 'Петров А.В.');
      setStatusChanging(false);
    }, 600);
  };

  const handleChangeStatus = (newStatus: ProcurementStatus) => {
    setShowStatusMenu(false);
    setStatusChanging(true);
    setTimeout(() => {
      changeStatus(id, newStatus, 'u1', 'Петров А.В.');
      setStatusChanging(false);
    }, 400);
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[
          {label:'Рабочий стол',href:'/dashboard'},
          {label:'Реестр закупок',href:'/zakupki'},
          {label:procurement.registryNumber},
        ]}/>

        {/* Заголовок */}
        <div className="gov-card mb-3">
          <div className="p-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <StatusBadge status={procurement.status}/>
                  {procurement.procedure && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded font-bold">
                      {{
                        'eat_kotировки': '🟢 ЕАТ «Берёзка»',
                        'eis_auction':   '🔵 ЕИС + Сбер-АСТ',
                        'eis_konkurs':   '🟡 ЕИС Конкурс',
                        'single':        '⚪ Едпоставщик',
                      }[procurement.procedure as string] ?? procurement.procedure}
                    </span>
                  )}
                  <RiskBadge level={procurement.riskLevel}/>
                  <PriorityBadge priority={procurement.priority}/>
                  {procurement.isOverdue && <OverdueBadge days={procurement.overduedays}/>}
                  {statusChanging && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded animate-pulse">
                      Обновление...
                    </span>
                  )}
                </div>
                <h1 className="text-base font-bold text-gray-900 mb-0.5">{procurement.title}</h1>
                <div className="text-xs text-gray-500">
                  {procurement.registryNumber}
                  {procurement.eatNumber && <> · ЕАТ: {procurement.eatNumber}</>}
                  {procurement.eisNumber && <> · ЕИС: {procurement.eisNumber}</>}
                  {' · '}{procurement.departmentName}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                {nextStatus && (
                  <button
                    onClick={handleAdvance}
                    disabled={statusChanging}
                    className="gov-btn gov-btn-success gov-btn-sm"
                  >
                    <CheckCircle size={12}/>
                    {statusChanging ? 'Обновление...' : `→ ${STATUS_LABELS[nextStatus]}`}
                  </button>
                )}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(s => !s)}
                    className="gov-btn gov-btn-secondary gov-btn-sm"
                  >
                    <Edit size={12}/> Сменить статус
                  </button>
                  {showStatusMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded shadow-xl z-50 max-h-64 overflow-y-auto">
                      {STATUS_ORDER.map(s => (
                        <button
                          key={s}
                          onClick={() => handleChangeStatus(s)}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 ${procurement.status === s ? 'font-bold bg-blue-50' : ''}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[s]?.includes('green') ? 'bg-green-500' : STATUS_COLORS[s]?.includes('yellow') ? 'bg-yellow-500' : STATUS_COLORS[s]?.includes('red') ? 'bg-red-500' : 'bg-gray-300'}`}/>
                          {STATUS_LABELS[s]}
                          {procurement.status === s && ' ✓'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <PrintProcurementButton procurement={procurement} />
                <button className="gov-btn gov-btn-ghost gov-btn-sm"><Download size={12}/></button>
              </div>
            </div>

            {/* Workflow */}
            {procurement.workflowSteps && (
              <div className="mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
                <WorkflowProgress steps={procurement.workflowSteps.map(s => ({
                  name: s.name, isCompleted: s.isCompleted, isActive: s.isActive, order: s.order,
                }))}/>
              </div>
            )}
          </div>
        </div>

        {/* Вкладки */}
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="gov-tabs min-w-max">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`gov-tab flex items-center gap-1 ${activeTab === tab.id ? 'active' : ''}`}>
                  {tab.icon}{tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">

            {/* ══ ОБЩИЕ СВЕДЕНИЯ ══ */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="gov-section-title mb-2">Основная информация</div>
                  <InfoRow label="Наименование" value={procurement.title}/>
                  <InfoRow label="Описание" value={<span className="text-xs text-gray-600 leading-relaxed">{procurement.description}</span>}/>
                  <InfoRow label="№ в реестре" value={<span className="font-mono font-bold">{procurement.registryNumber}</span>}/>
                  <InfoRow label="№ в ЕАТ «Берёзка»" value={procurement.eatNumber ?? '—'}/>
                  <InfoRow label="№ в ЕИС" value={procurement.eisNumber ?? '—'}/>
                  <InfoRow label="Тип закупки" value={PROCUREMENT_TYPE_LABELS[procurement.procurementType]}/>
                  <InfoRow label="Статус" value={<StatusBadge status={procurement.status}/>}/>
                  <InfoRow label="Риск" value={<RiskBadge level={procurement.riskLevel}/>}/>
                  <InfoRow label="Приоритет" value={<PriorityBadge priority={procurement.priority}/>}/>
                  <InfoRow label="Способ закупки" value={
                    <div>
                      <span className="text-xs font-bold">{PROCEDURE_LABELS[procurement.procedure ?? "eat_kotировки"]}</span>
                    </div>
                  }/>
                  <InfoRow label="Инициирующее подразд." value={procurement.szInitiatorDept ?? "—"}/>
                  <InfoRow label="Дата СЗ" value={procurement.szDate ? formatDate(procurement.szDate) : "—"}/>
                  {procurement.nmck && <InfoRow label="НМЦК" value={formatCurrency(procurement.nmck)}/>}
                  {procurement.economySumTotal && (
                    <InfoRow label="Экономия по торгам" value={`${formatCurrency(procurement.economySumTotal)} (${procurement.economyPct?.toFixed(1)}%)`}/>
                  )}
                  <InfoRow label="Теги" value={
                    <div className="flex flex-wrap gap-1">
                      {procurement.tags.map(t => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border">{t}</span>
                      ))}
                    </div>
                  }/>
                </div>
                <div>
                  <div className="gov-section-title mb-2">Организация</div>
                  <InfoRow label="Подразделение" value={procurement.departmentName}/>
                  <InfoRow label="Инициатор" value={procurement.initiatorName}/>
                  <InfoRow label="Ответственный" value={<span className="font-bold">{procurement.responsibleName}</span>}/>
                  <InfoRow label="Источник финансирования" value={procurement.financingSource}/>
                  <InfoRow label="КБК" value={<span className="font-mono text-xs">{procurement.kbk}</span>}/>
                  <InfoRow label="КОСГУ" value={<span className="font-mono">{procurement.kosgu}</span>}/>
                  <div className="gov-section-title mt-4 mb-2">Сроки</div>
                  <InfoRow label="Дата создания" value={formatDateTime(procurement.createdAt)}/>
                  <InfoRow label="Плановое начало" value={formatDate(procurement.plannedStartDate)}/>
                  <InfoRow label="Плановое окончание" value={
                    <span className={procurement.isOverdue ? 'text-red-600 font-bold' : ''}>{formatDate(procurement.plannedEndDate)}</span>
                  }/>
                  {procurement.contractDate && <InfoRow label="Дата договора" value={formatDate(procurement.contractDate)}/>}
                  {procurement.actualEndDate && <InfoRow label="Фактическое завершение" value={<span className="text-green-700 font-bold">{formatDate(procurement.actualEndDate)}</span>}/>}
                  <InfoRow label="Обновлено" value={formatDateTime(procurement.updatedAt)}/>
                </div>
              </div>
            )}

            {/* ══ ЭТАПЫ ══ */}
            {activeTab === 'etapy' && (
              <div>
                {/* Прогресс-сводка */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center">
                    <div className="text-xl font-bold text-blue-700">
                      {procurement.workflowSteps?.filter(s=>s.isCompleted).length??0}
                    </div>
                    <div className="text-xs text-blue-600">Завершено</div>
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-center">
                    <div className="text-xl font-bold text-yellow-700">1</div>
                    <div className="text-xs text-yellow-600">Текущий этап</div>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded text-center">
                    <div className="text-xl font-bold text-gray-600">
                      {(procurement.workflowSteps?.length??0) - (procurement.workflowSteps?.filter(s=>s.isCompleted).length??0) - 1}
                    </div>
                    <div className="text-xs text-gray-500">Впереди</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {procurement.workflowSteps?.map(step => (
                    <div key={step.id} className={`border rounded-lg overflow-hidden ${
                      step.isActive ? 'border-blue-400 shadow-sm' :
                      step.isCompleted ? 'border-green-200' :
                      'border-gray-200'
                    }`}>
                      <div className={`flex items-start gap-3 p-3 ${
                        step.isActive ? 'bg-blue-50' :
                        step.isCompleted ? 'bg-green-50' :
                        'bg-white'
                      }`}>
                        {/* Номер/иконка */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          step.isCompleted ? 'bg-green-500 text-white' :
                          step.isActive ? 'bg-blue-600 text-white' :
                          'bg-gray-100 text-gray-400 border border-gray-300'
                        }`}>
                          {step.isCompleted ? '✓' : step.order}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-gray-800">{step.name}</span>
                            {step.isActive && (
                              <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full font-bold animate-pulse">
                                ● ТЕКУЩИЙ
                              </span>
                            )}
                            {step.isCompleted && (
                              <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full font-bold">
                                ✓ ЗАВЕРШЁН
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 leading-relaxed mb-1">{step.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {step.responsible && (
                              <span>👤 <strong>{step.responsible}</strong></span>
                            )}
                            {step.completedAt && (
                              <span>✅ {formatDateTime(step.completedAt)}</span>
                            )}
                          </div>

                          {/* Документы этапа */}
                          {step.requiredDocuments && step.requiredDocuments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {step.requiredDocuments.map((doc: string, i: number) => (
                                <span key={i} className={`text-xs px-2 py-0.5 rounded border ${
                                  step.isCompleted
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : step.isActive
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : 'bg-gray-50 text-gray-500 border-gray-200'
                                }`}>
                                  📄 {doc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Кнопка завершить */}
                        {step.isActive && nextStatus && (
                          <button onClick={handleAdvance} disabled={statusChanging}
                            className="gov-btn gov-btn-success gov-btn-sm flex-shrink-0 whitespace-nowrap">
                            {statusChanging ? (
                              <span className="flex items-center gap-1">
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                              </span>
                            ) : (
                              <>✓ Завершить</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ПОЗИЦИИ ══ */}
            {activeTab === 'items' && (
              <div>
                <div className="flex justify-between mb-3">
                  <div className="text-xs text-gray-500">Позиций: {procurement.items.length}</div>
                </div>
                {procurement.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Позиции не добавлены</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="gov-table">
                      <thead><tr><th>№</th><th>Наименование</th><th>ОКПД2</th><th>Ед.изм.</th><th className="text-right">Кол-во</th><th className="text-right">Цена</th><th className="text-right">Сумма</th></tr></thead>
                      <tbody>
                        {procurement.items.map((item,i) => (
                          <tr key={item.id}>
                            <td className="text-center text-xs text-gray-400">{i+1}</td>
                            <td className="text-xs font-bold">{item.name}</td>
                            <td className="text-xs font-mono text-gray-500">{item.okpd2Code??'—'}</td>
                            <td className="text-xs">{item.unit}</td>
                            <td className="text-xs text-right font-bold">{item.quantity}</td>
                            <td className="text-xs text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-xs text-right font-bold text-blue-700">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td colSpan={6} className="text-xs font-bold text-right pr-3">ИТОГО:</td>
                          <td className="text-sm font-bold text-blue-800 text-right">{formatCurrency(procurement.items.reduce((s,i)=>s+i.totalPrice,0))}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══ ДОКУМЕНТЫ ══ */}
            {activeTab === 'dokumenty2' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-500">Документов: {DOCS.length}</div>
                  <>
                  <input
                    ref={fileInputRef as any}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xlsx,.xls,.jpg,.png"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="gov-btn gov-btn-secondary gov-btn-sm">
                    <Upload size={11}/> Загрузить
                  </button>
                </>
                </div>
                <div className="overflow-x-auto">
                  <table className="gov-table">
                    <thead><tr><th>Документ</th><th>Статус</th><th>Дата</th><th>Загружен</th><th>Размер</th><th>Действия</th></tr></thead>
                    <tbody>
                      {DOCS.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div className="text-xs font-bold">{doc.name}</div>
                            <div className="text-xs font-mono text-gray-400">{doc.file}</div>
                          </td>
                          <td><span className={`gov-badge ${DOC_CLR[doc.status]} border-0`}>{DOC_LBL[doc.status]}</span></td>
                          <td className="text-xs">{formatDate(doc.date)}</td>
                          <td className="text-xs font-bold">{doc.author}</td>
                          <td className="text-xs text-gray-500">{doc.size}</td>
                          <td><div className="flex gap-1"><button className="gov-btn gov-btn-ghost gov-btn-sm py-0"><Eye size={11}/></button><button className="gov-btn gov-btn-ghost gov-btn-sm py-0"><Download size={11}/></button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {uploadedFiles.length > 0 && uploadedFiles.map((f, i) => (
                    <tr key={`uf-${i}`} className="bg-blue-50">
                      <td>
                        <div className="text-xs font-bold text-blue-700">{f.name}</div>
                        <div className="text-xs font-mono text-gray-400">Загружен вами</div>
                      </td>
                      <td><span className="gov-badge bg-blue-50 text-blue-700 border-blue-200">Новый</span></td>
                      <td className="text-xs">{f.date}</td>
                      <td className="text-xs font-bold">Петров А.В.</td>
                      <td className="text-xs text-gray-500">{f.size}</td>
                      <td><button className="gov-btn gov-btn-ghost gov-btn-sm py-0"><Eye size={11}/></button></td>
                    </tr>
                  ))}
                </div>
              </div>
            )}

            {/* ══ ФИНАНСЫ ══ */}
            {activeTab === 'finansy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="gov-section-title mb-2">Финансовые показатели</div>
                  <InfoRow label="Плановая стоимость" value={<span className="font-bold">{formatCurrency(procurement.plannedSum)}</span>}/>
                  <InfoRow label="Сумма договора" value={procurement.contractSum ? <span className="font-bold text-blue-700">{formatCurrency(procurement.contractSum)}</span> : '—'}/>
                  <InfoRow label="Оплачено" value={<span className="font-bold text-green-700">{formatCurrency(procurement.paidSum??0)}</span>}/>
                  <InfoRow label="Остаток" value={procurement.contractSum ? <span className="font-bold text-orange-600">{formatCurrency(procurement.contractSum-(procurement.paidSum??0))}</span> : '—'}/>
                  <InfoRow label="Экономия" value={procurement.contractSum ? <span className="font-bold text-green-700">{formatCurrency(procurement.plannedSum-procurement.contractSum)} ({Math.round((1-procurement.contractSum/procurement.plannedSum)*100)}%)</span> : '—'}/>
                  <InfoRow label="КБК" value={<span className="font-mono text-xs">{procurement.kbk}</span>}/>
                  <InfoRow label="КОСГУ" value={procurement.kosgu}/>
                  <InfoRow label="Источник" value={procurement.financingSource}/>
                </div>
                <div>
                  <div className="gov-section-title mb-2">Исполнение бюджета</div>
                  {procurement.contractSum ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1"><span>Освоение</span><span className="font-bold">{executionPct}%</span></div>
                        <ProgressBar value={executionPct} max={100} colorClass={executionPct>90?'bg-green-500':executionPct>50?'bg-blue-500':'bg-yellow-500'}/>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 bg-gray-50 border rounded"><div className="font-bold text-gray-800">{formatCurrency(procurement.plannedSum)}</div><div className="text-gray-400">Плановая</div></div>
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded"><div className="font-bold text-blue-700">{formatCurrency(procurement.contractSum)}</div><div className="text-gray-400">Договор</div></div>
                        <div className="p-2 bg-green-50 border border-green-200 rounded"><div className="font-bold text-green-700">{formatCurrency(procurement.paidSum??0)}</div><div className="text-gray-400">Оплачено</div></div>
                      </div>
                    </div>
                  ) : <div className="text-xs text-gray-400 py-4">Договор не заключён</div>}
                </div>
              </div>
            )}

            {/* ══ ПОСТАВЩИК ══ */}
            {activeTab === 'postavshchik' && (
              procurement.supplierName ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="gov-section-title mb-2">Реквизиты</div>
                    <InfoRow label="Наименование" value={<span className="font-bold">{procurement.supplierName}</span>}/>
                    <InfoRow label="ИНН" value={<span className="font-mono">{procurement.supplierInn}</span>}/>
                  </div>
                  <div>
                    <div className="gov-section-title mb-2">Договор</div>
                    <InfoRow label="Дата заключения" value={formatDate(procurement.contractDate)}/>
                    <InfoRow label="Срок исполнения" value={formatDate(procurement.contractEndDate)}/>
                    <InfoRow label="Сумма договора" value={procurement.contractSum ? formatCurrency(procurement.contractSum) : '—'}/>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Building2 size={32} className="mx-auto mb-2 opacity-30"/>
                  <p className="text-sm">Поставщик не определён</p>
                  <p className="text-xs mt-1">Закупка ещё не прошла процедуру выбора поставщика</p>
                </div>
              )
            )}

            {/* ══ СОГЛАСОВАНИЯ ══ */}
            {activeTab === 'soglasovaniya2' && (
              <div className="space-y-3">
                {APPROVALS.map(step => (
                  <div key={step.id} className={`border rounded p-3 ${step.status==='approved'?'border-green-200 bg-green-50':'border-yellow-200 bg-yellow-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold">Этап {step.stage}: {step.approver}</div>
                        <div className="text-xs text-gray-500">{step.role}</div>
                      </div>
                      <span className={`gov-badge ${step.status==='approved'?'bg-green-100 text-green-700 border-green-300':'bg-yellow-100 text-yellow-700 border-yellow-300'}`}>
                        {step.status==='approved'?'✓ Согласовано':'⏳ Ожидает'}
                      </span>
                    </div>
                    {step.comment && <div className="mt-2 text-xs text-gray-700 bg-white border border-gray-200 rounded p-2">{step.comment}</div>}
                    {step.date && <div className="text-xs text-gray-400 mt-1">{formatDate(step.date)}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* ══ РИСКИ ══ */}
            {activeTab === 'riski2' && (
              <div>
                <div className="flex justify-between mb-3">
                  <div className="text-xs text-gray-500">Рисков: {procRisks.length}</div>
                  <button className="gov-btn gov-btn-ghost gov-btn-sm"><Plus size={11}/> Добавить риск</button>
                </div>
                {procRisks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Рисков не зафиксировано</div>
                ) : procRisks.map(r => (
                  <div key={r.id} className="border rounded p-3 mb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-800">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{r.description}</div>
                        {r.mitigation && <div className="text-xs text-blue-700 mt-1 p-2 bg-blue-50 border border-blue-200 rounded"><strong>План:</strong> {r.mitigation}</div>}
                      </div>
                      <RiskBadge level={r.level}/>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ══ КОММЕНТАРИИ ══ */}
            {activeTab === 'comments' && (
              <div>
                <div className="space-y-3 mb-4">
                  {allComments.map(c => (
                    <div key={c.id} className={`rounded border p-3 ${c.internal?'bg-yellow-50 border-yellow-200':'bg-white border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-xs font-bold">{c.author}</span>
                          <span className="text-xs text-gray-400 ml-2">{c.role}</span>
                          {c.internal && <span className="ml-2 text-xs px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded font-bold">Внутренний</span>}
                        </div>
                        <span className="text-xs text-gray-400">{formatDateTime(c.date)}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{c.text}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3">
                  <div className="text-xs font-bold text-gray-700 mb-2">Добавить комментарий</div>
                  <textarea className="gov-input min-h-16 resize-none mb-2" placeholder="Введите комментарий..." value={commentText} onChange={e=>setCommentText(e.target.value)}/>
                  <div className="flex items-center gap-2">
                    <button onClick={handleAddComment} className="gov-btn gov-btn-primary gov-btn-sm">Отправить</button>
                    <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                      <input type="checkbox" className="mr-1" checked={isInternal} onChange={e=>setIsInternal(e.target.checked)}/> Внутренний
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ИСТОРИЯ ══ */}
            {activeTab === 'history' && (
              <div className="space-y-1">
                {historyItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">История изменений пуста</div>
                ) : historyItems.map(h => (
                  <div key={h.id} className="flex gap-3 py-2 border-b border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><Clock size={10} className="text-blue-600"/></div>
                    <div className="flex-1">
                      <div className="text-xs"><span className="font-bold">{h.userName}</span>{' '}<span className="text-gray-600">{h.description}</span></div>
                      {h.oldValue && h.newValue && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          <span className="line-through text-red-500">{h.oldValue}</span>{' → '}<span className="text-green-600 font-bold">{h.newValue}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(h.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
