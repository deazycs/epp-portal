'use client';

import { useState } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, XCircle, DollarSign, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Статусы СЗ — полная цепочка согласования
type SZStatus = 'draft' | 'pending' | 'approved_head' | 'lbo_check' | 'funded' | 'approved' | 'rejected' | 'no_funds';

interface ServiceNote {
  id: string;
  number: string;
  title: string;
  author: string;
  dept: string;
  addressee: string;
  procId?: string;
  status: SZStatus;
  date: string;
  sum: number;
  kbk?: string;
  comment: string;
  lboComment?: string;
  lboDate?: string;
}

const NOTES: ServiceNote[] = [
  {
    id:'sz1', number:'СЗ-МТО-2026-078',
    title:'Запрос на закупку картриджей для принтеров и МФУ (II кв. 2026)',
    author:'Швецов К.Е.', dept:'Отдел МТО', addressee:'Черемных М.Ю.',
    procId:'p001', status:'approved', date:'2026-03-28', sum:162000,
    kbk:'321 0412 54 4 01 90020 244',
    comment:'Согласована. ЛБО подтверждены Пикинер О.В. 29.03.2026.',
    lboComment:'ЛБО в наличии по КБК 321 0412 54 4 01 90020 244, КОСГУ 344. Лимит 250 000 руб., свободно 182 000 руб.',
    lboDate:'2026-03-29',
  },
  {
    id:'sz2', number:'СЗ-ОО-2026-091',
    title:'Запрос на услуги комплексной уборки здания (III кв. 2026)',
    author:'Давыдова Ф.А.', dept:'Отдел общего обеспечения', addressee:'Толоконников Ю.В.',
    procId:'p003', status:'lbo_check', date:'2026-05-12', sum:375000,
    kbk:'321 0412 54 4 01 90020 243',
    comment:'Согласована Толоконниковым Ю.В. 13.05.2026. Передана в ФЭО для проверки ЛБО.',
    lboComment:'',
  },
  {
    id:'sz3', number:'СЗ-ИТ-2026-055',
    title:'Запрос на лицензии Microsoft 365 Business Premium (50 лиц.)',
    author:'Митусов С.А.', dept:'ИТ-отдел', addressee:'Черемных М.Ю.',
    procId:'p009', status:'approved', date:'2026-01-18', sum:385000,
    kbk:'321 0412 54 4 01 90020 242',
    comment:'Согласована. ЛБО подтверждены. Единственный поставщик по ст.93.',
    lboComment:'ЛБО в наличии по КБК 321 0412 54 4 01 90020 242, КОСГУ 226. Лимит 500 000 руб.',
    lboDate:'2026-01-20',
  },
  {
    id:'sz4', number:'СЗ-ИТ-2026-112',
    title:'Запрос на разработку СМЭВ-адаптера для ГИС ЕГРН',
    author:'Митусов С.А.', dept:'ИТ-отдел', addressee:'Толоконников Ю.В.',
    procId:'p005', status:'approved_head', date:'2026-04-19', sum:1850000,
    kbk:'321 0412 54 4 01 90020 243',
    comment:'Согласована Толоконниковым Ю.В. Ожидает подтверждения ЛБО от ФЭО.',
    lboComment:'',
  },
  {
    id:'sz5', number:'СЗ-ОО-2026-063',
    title:'Запрос на поставку офисной мебели (5 кабинетов)',
    author:'Давыдова Ф.А.', dept:'Отдел общего обеспечения', addressee:'Черемных М.Ю.',
    procId:'p008', status:'approved', date:'2026-04-03', sum:445000,
    kbk:'321 0412 54 4 01 90020 244',
    comment:'Согласована. ЛБО подтверждены. ЕАТ Берёзка.',
    lboComment:'ЛБО в наличии. Лимит 500 000 руб., КОСГУ 346.',
    lboDate:'2026-04-05',
  },
  {
    id:'sz6', number:'СЗ-МТО-2026-034',
    title:'Запрос на закупку бумаги офисной А4/А3 (I п/г 2026)',
    author:'Швецов К.Е.', dept:'Отдел МТО', addressee:'Черемных М.Ю.',
    procId:'p004', status:'approved', date:'2026-01-08', sum:94500,
    kbk:'321 0412 54 4 01 90020 244',
    comment:'Согласована. ЛБО подтверждены.',
    lboComment:'ЛБО в наличии по КБК 321 0412 54 4 01 90020 244, КОСГУ 344.',
    lboDate:'2026-01-09',
  },
  {
    id:'sz7', number:'СЗ-ИТ-2026-088',
    title:'Запрос на серверное оборудование для ЦОД (Dell + NetApp)',
    author:'Митусов С.А.', dept:'ИТ-отдел', addressee:'Толоконников Ю.В.',
    procId:'p002', status:'approved', date:'2026-02-06', sum:4850000,
    kbk:'321 0412 54 4 01 90020 242',
    comment:'Согласована. ЛБО подтверждены. Электронный аукцион ЕИС+Сбер-АСТ.',
    lboComment:'ЛБО в наличии по КБК 321 0412 54 4 01 90020 242, КОСГУ 310. Лимит 5 500 000 руб.',
    lboDate:'2026-02-08',
  },
  {
    id:'sz8', number:'СЗ-ОО-2026-119',
    title:'Запрос на страхование автотранспорта (КАСКО+ОСАГО)',
    author:'Давыдова Ф.А.', dept:'Отдел общего обеспечения', addressee:'Черемных М.Ю.',
    procId:'p007', status:'pending', date:'2026-05-18', sum:112000,
    kbk:'321 0412 54 4 01 90020 243',
    comment:'',
  },
  {
    id:'sz9', number:'СЗ-МТО-2026-095',
    title:'Запрос на ТО лифтового оборудования (2026 год, 6 мес.)',
    author:'Швецов К.Е.', dept:'Отдел МТО', addressee:'Толоконников Ю.В.',
    procId:'p010', status:'approved', date:'2026-04-26', sum:198000,
    kbk:'321 0412 54 4 01 90020 243',
    comment:'Согласована. ЛБО подтверждены. ЕАТ Берёзка.',
    lboComment:'ЛБО в наличии, КОСГУ 225.',
    lboDate:'2026-04-28',
  },
  {
    id:'sz10', number:'СЗ-ОГТ-2026-007',
    title:'Запрос на оборудование системы контроля доступа',
    author:'Щербинин Р.С.', dept:'ОГТ', addressee:'Толоконников Ю.В.',
    status:'no_funds', date:'2026-03-10', sum:620000,
    kbk:'321 0412 54 4 01 90071 244',
    comment:'Отклонена ФЭО — недостаточно ЛБО в текущем периоде. Рекомендовано перенести на III кв. 2026.',
    lboComment:'ЛБО недостаточно. Свободный остаток по КБК 321 0412 54 4 01 90071 244 составляет 180 000 руб., запрошено 620 000 руб. Дефицит 440 000 руб.',
    lboDate:'2026-03-12',
  },
];

// Схема статусов СЗ — полная цепочка
const CHAIN: { status: SZStatus; label: string; who: string; color: string }[] = [
  { status: 'draft',        label: 'Черновик',               who: 'Инициатор',            color: '#9ca3af' },
  { status: 'pending',      label: 'На рассмотрении МТО',    who: 'МТО / Черемных М.Ю.', color: '#f59e0b' },
  { status: 'approved_head',label: 'Согласована руководством',who: 'Толоконников Ю.В.',   color: '#8b5cf6' },
  { status: 'lbo_check',    label: 'Проверка ЛБО в ФЭО',     who: 'Пикинер О.В. (ФЭО)', color: '#f97316' },
  { status: 'funded',       label: 'ЛБО подтверждены',       who: 'Пикинер О.В. (ФЭО)', color: '#10b981' },
  { status: 'approved',     label: 'Готова к закупке',        who: 'МТО создаёт закупку', color: '#059669' },
];

const ST_CONFIG: Record<SZStatus, { label: string; icon: React.ReactNode; bg: string; text: string; border: string }> = {
  draft:         { label:'Черновик',              icon:<FileText size={11}/>,    bg:'#f9fafb', text:'#6b7280', border:'#d1d5db' },
  pending:       { label:'На рассмотрении',       icon:<Clock size={11}/>,       bg:'#fffbeb', text:'#b45309', border:'#fcd34d' },
  approved_head: { label:'Согласована рук-вом',   icon:<CheckCircle size={11}/>, bg:'#f5f3ff', text:'#7c3aed', border:'#c4b5fd' },
  lbo_check:     { label:'Проверка ЛБО (ФЭО)',    icon:<DollarSign size={11}/>,  bg:'#fff7ed', text:'#c2410c', border:'#fdba74' },
  funded:        { label:'ЛБО подтверждены',      icon:<CheckCircle size={11}/>, bg:'#ecfdf5', text:'#065f46', border:'#6ee7b7' },
  approved:      { label:'✅ Готова к закупке',   icon:<CheckCircle size={11}/>, bg:'#ecfdf5', text:'#065f46', border:'#34d399' },
  rejected:      { label:'Отклонена',             icon:<XCircle size={11}/>,     bg:'#fef2f2', text:'#991b1b', border:'#fca5a5' },
  no_funds:      { label:'❌ Недостаточно ЛБО',   icon:<AlertTriangle size={11}/>,bg:'#fef2f2', text:'#991b1b', border:'#fca5a5' },
};

// Состояния для интерактивного изменения статусов (демо)
export default function SluzhebnyeZapiskiPage() {
  const [search, setSearch]     = useState('');
  const [sf, setSf]             = useState('all');
  const [selected, setSelected] = useState<string|null>('sz1');
  const [notes, setNotes]       = useState<ServiceNote[]>(NOTES);
  const [lboText, setLboText]   = useState('');

  const filtered = notes.filter(n => {
    const okS  = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.number.includes(search);
    const okSt = sf === 'all'
      || (sf === 'pending'  && ['pending','approved_head','lbo_check'].includes(n.status))
      || (sf === 'approved' && ['approved','funded'].includes(n.status))
      || (sf === 'lbo'      && ['lbo_check','funded'].includes(n.status))
      || (sf === 'draft'    && n.status === 'draft')
      || (sf === 'problem'  && ['rejected','no_funds'].includes(n.status));
    return okS && okSt;
  });

  const sel = notes.find(n => n.id === selected);

  const advance = (id: string, newStatus: SZStatus, comment: string) => {
    setNotes(prev => prev.map(n =>
      n.id === id
        ? { ...n, status: newStatus, comment, lboDate: newStatus === 'funded' || newStatus === 'no_funds' ? new Date().toLocaleDateString('ru-RU') : n.lboDate }
        : n
    ));
    setLboText('');
  };

  const counts = {
    total:    notes.length,
    approved: notes.filter(n => ['approved','funded'].includes(n.status)).length,
    pending:  notes.filter(n => ['pending','approved_head','lbo_check'].includes(n.status)).length,
    lbo:      notes.filter(n => ['lbo_check','funded'].includes(n.status)).length,
    problem:  notes.filter(n => ['rejected','no_funds'].includes(n.status)).length,
  };

  const currentChainStep = sel
    ? CHAIN.findIndex(s => s.status === sel.status)
    : -1;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Служебные записки'}]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Служебные записки</h1>
            <p className="text-xs text-gray-500">
              Запросы от подразделений · Цепочка: СЗ → согласование → проверка ЛБО → закупка
            </p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12}/> Новая СЗ</button>
        </div>

        {/* Схема процесса */}
        <div className="gov-card p-3 mb-3 overflow-x-auto">
          <div className="text-xs font-bold text-gray-600 mb-2">Порядок согласования СЗ:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 600 }}>
            {CHAIN.map((step, i) => (
              <div key={step.status} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', width: 100 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', lineHeight: 1.2 }}>{step.label}</div>
                  <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>{step.who}</div>
                </div>
                {i < CHAIN.length - 1 && (
                  <div style={{ width: 24, height: 1, background: '#d1d5db', flexShrink: 0 }}/>
                )}
              </div>
            ))}
            {/* Финальный шаг */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 24, height: 1, background: '#d1d5db' }}/>
              <div style={{ textAlign: 'center', width: 100 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#003087', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                  7
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', lineHeight: 1.2 }}>Создание закупки</div>
                <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 1 }}>МТО на ЕАТ/ЕИС</div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          {[
            { k:'all',     label:'Всего',           val:counts.total,    color:'#374151' },
            { k:'pending', label:'Ожидают действий',val:counts.pending,  color:'#b45309' },
            { k:'lbo',     label:'Проверка ЛБО',    val:counts.lbo,      color:'#c2410c' },
            { k:'approved',label:'Готовы к закупке',val:counts.approved, color:'#059669' },
          ].map(s=>(
            <button key={s.k} onClick={()=>setSf(s.k)}
              className="gov-card p-3 text-left" style={sf===s.k?{boxShadow:'0 0 0 2px #3b82f6'}:{}}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Список */}
          <div className="lg:col-span-2 space-y-2">
            <div className="gov-card p-2 flex gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input className="gov-input pl-7 text-xs" placeholder="Поиск..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              {[
                {k:'all',label:'Все'},
                {k:'pending',label:'На рассмотрении'},
                {k:'lbo',label:'Проверка ЛБО'},
                {k:'approved',label:'Согласованы'},
                {k:'problem',label:'Проблемные'},
              ].map(b=>(
                <button key={b.k} onClick={()=>setSf(b.k)}
                  className={`gov-btn gov-btn-sm ${sf===b.k?'gov-btn-primary':'gov-btn-ghost'}`}>{b.label}</button>
              ))}
            </div>

            {filtered.map(n => {
              const st = ST_CONFIG[n.status];
              return (
                <div key={n.id}
                  onClick={()=>setSelected(n.id===selected?null:n.id)}
                  className="gov-card gov-card-hover p-3 cursor-pointer" style={selected===n.id?{borderColor:'#60a5fa',borderWidth:2}:{}}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold text-blue-600">{n.number}</span>
                        <span className="gov-badge flex items-center gap-1"
                          style={{ background: st.bg, color: st.text, borderColor: st.border }}>
                          {st.icon} {st.label}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-800 leading-snug">{n.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {n.author} · {n.dept} → {n.addressee} · {formatDate(n.date)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-blue-700">{formatCurrency(n.sum)}</div>
                      {n.kbk && <div className="text-xs font-mono text-gray-400 mt-0.5">{n.kbk.slice(-3)}</div>}
                    </div>
                  </div>
                  {n.comment && (
                    <div className="text-xs text-gray-500 mt-1 italic truncate">{n.comment}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Детальная панель */}
          <div className="space-y-3 sticky top-4">
            {sel ? (
              <>
                {/* Основная информация */}
                <div className="gov-card overflow-hidden">
                  <div className="gov-section-title">📋 {sel.number}</div>
                  <div className="p-3 space-y-2">
                    <div className="text-xs font-bold text-gray-800">{sel.title}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-400">Инициатор:</span><div className="font-bold">{sel.author}</div></div>
                      <div><span className="text-gray-400">Подразделение:</span><div className="font-bold">{sel.dept}</div></div>
                      <div><span className="text-gray-400">Адресат:</span><div className="font-bold">{sel.addressee}</div></div>
                      <div><span className="text-gray-400">Дата:</span><div className="font-bold">{formatDate(sel.date)}</div></div>
                      <div><span className="text-gray-400">Запрашиваемая сумма:</span><div className="font-bold text-blue-700">{formatCurrency(sel.sum)}</div></div>
                      {sel.kbk && <div><span className="text-gray-400">КБК:</span><div className="font-mono text-xs">{sel.kbk}</div></div>}
                    </div>
                  </div>
                </div>

                {/* Текущий этап в цепочке */}
                <div className="gov-card overflow-hidden">
                  <div className="gov-section-title">📍 Ход согласования</div>
                  <div className="p-3">
                    <div className="space-y-2">
                      {[
                        { idx:0, label:'Подана инициатором',            done: true },
                        { idx:1, label:'Рассмотрена МТО',              done: currentChainStep >= 1 },
                        { idx:2, label:'Согласована Толоконниковым Ю.В.', done: currentChainStep >= 2 },
                        { idx:3, label:'Передана в ФЭО (проверка ЛБО)', done: currentChainStep >= 3 },
                        { idx:4, label:'ФЭО подтвердила наличие ЛБО',  done: currentChainStep >= 4 || sel.status === 'approved' },
                        { idx:5, label:'✅ Готова — МТО создаёт закупку', done: sel.status === 'approved' },
                      ].map(step => (
                        <div key={step.idx} className="flex items-center gap-2">
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: step.done ? '#059669' : sel.status === 'no_funds' && step.idx >= 4 ? '#dc2626' : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: step.done ? '#fff' : '#9ca3af',
                          }}>
                            {step.done ? '✓' : step.idx + 1}
                          </div>
                          <span className={`text-xs ${step.done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Блок ЛБО */}
                {(sel.lboComment || sel.status === 'lbo_check' || sel.status === 'approved_head') && (
                  <div className="gov-card overflow-hidden">
                    <div className="gov-section-title">💰 Проверка ЛБО — Пикинер О.В. (ФЭО)</div>
                    <div className="p-3">
                      {sel.lboComment ? (
                        <div className="text-xs p-2 rounded mb-2"
                          style={{ background: sel.status === 'no_funds' ? '#fef2f2' : '#ecfdf5',
                            color: sel.status === 'no_funds' ? '#991b1b' : '#065f46',
                            border: `1px solid ${sel.status === 'no_funds' ? '#fca5a5' : '#6ee7b7'}` }}>
                          <div className="font-bold mb-1">{sel.status === 'no_funds' ? '❌ Недостаточно ЛБО:' : '✅ ЛБО подтверждены:'}</div>
                          {sel.lboComment}
                          {sel.lboDate && <div className="mt-1 text-xs opacity-70">Дата: {sel.lboDate}</div>}
                        </div>
                      ) : sel.status === 'lbo_check' ? (
                        <div className="space-y-2">
                          <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 p-2 rounded">
                            ⏳ ФЭО проверяет наличие лимитов бюджетных обязательств по КБК {sel.kbk}
                          </p>
                          <textarea className="gov-input text-xs resize-none" rows={2}
                            placeholder="Заключение ФЭО по ЛБО..."
                            value={lboText} onChange={e=>setLboText(e.target.value)}/>
                          <div className="flex gap-2">
                            <button
                              onClick={() => advance(sel.id, 'approved',
                                `Согласована. ЛБО подтверждены Пикинер О.В. ${new Date().toLocaleDateString('ru-RU')}. ${lboText}`)}
                              disabled={!lboText.trim()}
                              className="flex-1 gov-btn gov-btn-success gov-btn-sm justify-center disabled:opacity-40">
                              ✅ ЛБО в наличии
                            </button>
                            <button
                              onClick={() => advance(sel.id, 'no_funds',
                                `Отклонена ФЭО — недостаточно ЛБО. ${lboText}`)}
                              disabled={!lboText.trim()}
                              className="gov-btn gov-btn-danger gov-btn-sm disabled:opacity-40">
                              ❌ ЛБО нет
                            </button>
                          </div>
                        </div>
                      ) : sel.status === 'approved_head' ? (
                        <div className="space-y-2">
                          <p className="text-xs text-purple-700 bg-purple-50 border border-purple-200 p-2 rounded">
                            СЗ согласована руководством. Нужно передать в ФЭО для проверки наличия ЛБО.
                          </p>
                          <button
                            onClick={() => advance(sel.id, 'lbo_check',
                              'Передана в ФЭО для проверки лимитов бюджетных обязательств.')}
                            className="w-full gov-btn gov-btn-secondary gov-btn-sm justify-center">
                            → Передать в ФЭО на проверку ЛБО
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Кнопка согласования Толоконникова */}
                {sel.status === 'pending' && (
                  <div className="gov-card p-3">
                    <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-2 rounded mb-2">
                      Ожидает согласования Толоконникова Ю.В.
                    </p>
                    <button
                      onClick={() => advance(sel.id, 'approved_head',
                        `Согласована Толоконниковым Ю.В. ${new Date().toLocaleDateString('ru-RU')}. Передать в ФЭО для проверки ЛБО.`)}
                      className="w-full gov-btn gov-btn-success gov-btn-sm justify-center">
                      ✓ Согласовать (Толоконников Ю.В.)
                    </button>
                  </div>
                )}

                {/* Кнопка создания закупки */}
                {sel.status === 'approved' && sel.procId && (
                  <div className="p-3 rounded-lg border-2 border-green-400" style={{ background: '#ecfdf5' }}>
                    <div className="text-xs font-bold text-green-800 mb-2">
                      ✅ СЗ согласована и финансирование подтверждено — МТО может создавать закупку
                    </div>
                    <Link href="/zakupki/novaya"
                      className="gov-btn gov-btn-success gov-btn-sm w-full justify-center">
                      → Создать закупку на основании СЗ
                    </Link>
                  </div>
                )}

                {sel.status === 'no_funds' && (
                  <div className="p-3 rounded-lg border border-red-300" style={{ background: '#fef2f2' }}>
                    <div className="text-xs font-bold text-red-700 mb-1">
                      ❌ Закупка невозможна — недостаточно ЛБО
                    </div>
                    <div className="text-xs text-red-600">
                      Рекомендуется перенести закупку на следующий квартал или запросить перераспределение лимитов.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="gov-card p-8 text-center text-gray-400">
                <FileText size={32} className="mx-auto mb-2 opacity-20"/>
                <p className="text-sm">Выберите служебную записку</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
