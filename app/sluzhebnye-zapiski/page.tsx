'use client';
import { useState } from 'react';
import { Plus, Search, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const NOTES = [
  { id:'sz1', number:'СЗ-МТО-2026-078', title:'Запрос на закупку картриджей для принтеров (II кв. 2026)', author:'Петров А.В.', dept:'Отдел МТО', addressee:'Смирнова Н.С.', procId:'p001', status:'approved', date:'2026-03-28', sum:162000, comment:'Согласована. Включить в план-график II кв. 2026.' },
  { id:'sz2', number:'СЗ-АХО-2026-091', title:'Запрос на услуги комплексной уборки (III кв. 2026)', author:'Орлова Т.В.', dept:'АХО', addressee:'Фёдоров С.В.', procId:'p003', status:'pending', date:'2026-05-12', sum:375000, comment:'' },
  { id:'sz3', number:'СЗ-ИТ-2026-055', title:'Запрос на лицензии Microsoft 365 Business Premium (50 лиц.)', author:'Никитин П.А.', dept:'ИТ-отдел', addressee:'Смирнова Н.С.', procId:'p009', status:'approved', date:'2026-01-18', sum:385000, comment:'Согласована. Единственный поставщик по ст.93.' },
  { id:'sz4', number:'СЗ-ИТ-2026-112', title:'Запрос на разработку СМЭВ-адаптера для ГИС ЕГРН', author:'Никитин П.А.', dept:'ИТ-отдел', addressee:'Фёдоров С.В.', procId:'p005', status:'pending', date:'2026-04-19', sum:1850000, comment:'' },
  { id:'sz5', number:'СЗ-АХО-2026-063', title:'Запрос на поставку офисной мебели (5 кабинетов)', author:'Орлова Т.В.', dept:'АХО', addressee:'Смирнова Н.С.', procId:'p008', status:'approved', date:'2026-04-03', sum:445000, comment:'Согласована. ЕАТ Берёзка, запрос котировок.' },
  { id:'sz6', number:'СЗ-МТО-2026-034', title:'Запрос на закупку бумаги офисной А4/А3 (I п/г 2026)', author:'Петров А.В.', dept:'Отдел МТО', addressee:'Смирнова Н.С.', procId:'p004', status:'approved', date:'2026-01-08', sum:94500, comment:'Согласована.' },
  { id:'sz7', number:'СЗ-ИТ-2026-088', title:'Запрос на серверное оборудование для ЦОД (Dell + NetApp)', author:'Никитин П.А.', dept:'ИТ-отдел', addressee:'Фёдоров С.В.', procId:'p002', status:'approved', date:'2026-02-06', sum:4850000, comment:'Согласована. Электронный аукцион ЕИС+Сбер-АСТ.' },
  { id:'sz8', number:'СЗ-АХО-2026-119', title:'Запрос на страхование автотранспорта (КАСКО+ОСАГО)', author:'Орлова Т.В.', dept:'АХО', addressee:'Смирнова Н.С.', procId:'p007', status:'draft', date:'2026-05-18', sum:112000, comment:'' },
  { id:'sz9', number:'СЗ-МТО-2026-095', title:'Запрос на ТО лифтового оборудования (2026 год, 6 мес.)', author:'Петров А.В.', dept:'Отдел МТО', addressee:'Фёдоров С.В.', procId:'p010', status:'approved', date:'2026-04-26', sum:198000, comment:'Согласована. ЕАТ Берёзка.' },
];

const ST: Record<string,{label:string;cls:string;icon:React.ReactNode}> = {
  draft:    { label:'Черновик',        cls:'bg-gray-100 text-gray-600 border-gray-300',   icon:<FileText size={11}/> },
  pending:  { label:'На рассмотрении', cls:'bg-yellow-50 text-yellow-700 border-yellow-300', icon:<Clock size={11}/> },
  approved: { label:'Согласована',     cls:'bg-green-50 text-green-700 border-green-300',  icon:<CheckCircle size={11}/> },
  rejected: { label:'Отклонена',       cls:'bg-red-50 text-red-700 border-red-300',        icon:<XCircle size={11}/> },
};

export default function SluzhebnyeZapiskiPage() {
  const [search, setSearch] = useState('');
  const [sf, setSf]         = useState('all');
  const [selected, setSelected] = useState<string|null>(null);

  const filtered = NOTES.filter(n => {
    const okS  = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.number.includes(search);
    const okSt = sf === 'all' || n.status === sf;
    return okS && okSt;
  });

  const sel = NOTES.find(n => n.id === selected);
  const stats = { total: NOTES.length, approved: NOTES.filter(n=>n.status==='approved').length, pending: NOTES.filter(n=>n.status==='pending').length, draft: NOTES.filter(n=>n.status==='draft').length };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Служебные записки'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Служебные записки</h1>
            <p className="text-xs text-gray-500">Запросы на закупки от подразделений</p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12}/> Новая СЗ</button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {label:'Всего',           val:stats.total,    cls:'text-gray-700'},
            {label:'Согласовано',     val:stats.approved, cls:'text-green-700'},
            {label:'На рассмотрении', val:stats.pending,  cls:'text-yellow-700'},
            {label:'Черновики',       val:stats.draft,    cls:'text-gray-500'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Список */}
          <div className="lg:col-span-2">
            <div className="gov-card p-2 mb-2 flex gap-2">
              <div className="relative flex-1">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input className="gov-input pl-7 text-xs" placeholder="Поиск по номеру или теме..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              {['all','pending','approved','draft'].map(s=>(
                <button key={s} onClick={()=>setSf(s)} className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
                  {{all:'Все',pending:'На рассмотрении',approved:'Согласованы',draft:'Черновики'}[s as 'all']}
                </button>
              ))}
            </div>

            <div className="gov-card overflow-hidden">
              <div className="divide-y divide-gray-100">
                {filtered.map(n=>(
                  <div key={n.id} onClick={()=>setSelected(n.id===selected?null:n.id)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected===n.id?'bg-blue-50 border-l-2 border-l-blue-600':''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-blue-600 flex-shrink-0">{n.number}</span>
                          <span className={`gov-badge flex items-center gap-1 ${ST[n.status].cls}`}>
                            {ST[n.status].icon} {ST[n.status].label}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 mb-0.5">{n.title}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>👤 {n.author} ({n.dept})</span>
                          <span>→ {n.addressee}</span>
                          <span>📅 {formatDate(n.date)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-gray-800">{n.sum.toLocaleString('ru-RU')} ₽</div>
                      </div>
                    </div>
                    {n.comment && (
                      <div className="mt-1.5 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                        💬 {n.comment}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Детали */}
          <div>
            {sel ? (
              <div className="gov-card overflow-hidden sticky top-4">
                <div className="gov-section-title">📄 {sel.number}</div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Тема</div>
                    <div className="text-xs font-bold text-gray-800">{sel.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><div className="text-xs text-gray-500">Автор</div><div className="text-xs font-bold">{sel.author}</div></div>
                    <div><div className="text-xs text-gray-500">Подразделение</div><div className="text-xs font-bold">{sel.dept}</div></div>
                    <div><div className="text-xs text-gray-500">Адресат</div><div className="text-xs font-bold">{sel.addressee}</div></div>
                    <div><div className="text-xs text-gray-500">Дата</div><div className="text-xs font-bold">{formatDate(sel.date)}</div></div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Запрашиваемая сумма</div>
                    <div className="text-sm font-bold text-blue-700">{sel.sum.toLocaleString('ru-RU')} ₽</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Статус</div>
                    <span className={`gov-badge ${ST[sel.status].cls}`}>{ST[sel.status].label}</span>
                  </div>
                  {sel.comment && (
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <div className="font-bold mb-0.5">Резолюция:</div>
                      {sel.comment}
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <Link href={`/zakupki/${sel.procId}`} className="gov-btn gov-btn-primary gov-btn-sm w-full justify-center">
                      → Открыть закупку
                    </Link>
                    {sel.status === 'pending' && (
                      <div className="flex gap-1">
                        <button className="gov-btn gov-btn-ghost gov-btn-sm flex-1 text-green-700">✓ Согласовать</button>
                        <button className="gov-btn gov-btn-ghost gov-btn-sm flex-1 text-red-600">✕ Отклонить</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="gov-card p-6 text-center text-gray-400">
                <FileText size={28} className="mx-auto mb-2 opacity-30"/>
                <p className="text-xs">Выберите служебную записку для просмотра деталей</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
