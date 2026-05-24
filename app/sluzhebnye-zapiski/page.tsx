'use client';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const NOTES = [
  { id:'sz1', number:'СЗ-МТО-2026-078', title:'Запрос на закупку картриджей для принтеров (II кв. 2026)', author:'Петров А.В.', dept:'Отдел МТО', addressee:'Смирнова Н.С.', procId:'p001', status:'approved', date:'2026-03-28' },
  { id:'sz2', number:'СЗ-АХО-2026-091', title:'Запрос на услуги комплексной уборки (III кв. 2026)', author:'Орлова Т.В.', dept:'АХО', addressee:'Фёдоров С.В.', procId:'p003', status:'pending', date:'2026-05-12' },
  { id:'sz3', number:'СЗ-ИТ-2026-055',  title:'Запрос на лицензии Microsoft 365 Business Premium', author:'Никитин П.А.', dept:'ИТ-отдел', addressee:'Смирнова Н.С.', procId:'p009', status:'approved', date:'2026-01-18' },
  { id:'sz4', number:'СЗ-ИТ-2026-112',  title:'Запрос на разработку СМЭВ-адаптера для ГИС ЕГРН', author:'Никитин П.А.', dept:'ИТ-отдел', addressee:'Фёдоров С.В.', procId:'p005', status:'pending', date:'2026-04-19' },
  { id:'sz5', number:'СЗ-АХО-2026-063', title:'Запрос на поставку офисной мебели (5 кабинетов)', author:'Орлова Т.В.', dept:'АХО', addressee:'Смирнова Н.С.', procId:'p008', status:'approved', date:'2026-04-03' },
  { id:'sz6', number:'СЗ-МТО-2026-034', title:'Запрос на закупку бумаги офисной А4/А3 (I п/г 2026)', author:'Петров А.В.', dept:'Отдел МТО', addressee:'Смирнова Н.С.', procId:'p004', status:'approved', date:'2026-01-08' },
  { id:'sz7', number:'СЗ-ИТ-2026-088',  title:'Запрос на закупку серверного оборудования для ЦОД', author:'Никитин П.А.', dept:'ИТ-отдел', addressee:'Фёдоров С.В.', procId:'p002', status:'approved', date:'2026-02-06' },
  { id:'sz8', number:'СЗ-АХО-2026-119', title:'Запрос на страхование автотранспорта (полис КАСКО)', author:'Орлова Т.В.', dept:'АХО', addressee:'Смирнова Н.С.', procId:'p007', status:'draft', date:'2026-05-18' },
];

const ST: Record<string,{label:string,cls:string}> = {
  draft:    { label:'Черновик',         cls:'bg-gray-100 text-gray-600 border-gray-300' },
  pending:  { label:'На рассмотрении',  cls:'bg-yellow-50 text-yellow-700 border-yellow-300' },
  approved: { label:'Согласована',      cls:'bg-green-50 text-green-700 border-green-300' },
  rejected: { label:'Отклонена',        cls:'bg-red-50 text-red-700 border-red-300' },
};

export default function SluzhebnyeZapiskiPage() {
  const [search, setSearch] = useState('');
  const [sf, setSf] = useState('all');

  const filtered = NOTES.filter(n => {
    const okS = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.number.includes(search);
    const okSt = sf === 'all' || n.status === sf;
    return okS && okSt;
  });

  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Служебные записки'}]}/>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Реестр служебных записок</h1>
            <p className="text-xs text-gray-500">Всего: {NOTES.length} · На рассмотрении: {NOTES.filter(n=>n.status==='pending').length}</p>
          </div>
          <button className="gov-btn gov-btn-primary gov-btn-sm"><Plus size={12}/> Создать</button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {label:'Всего',         val:NOTES.length,                                       cls:'text-gray-700'},
            {label:'Черновики',     val:NOTES.filter(n=>n.status==='draft').length,          cls:'text-gray-500'},
            {label:'На рассм.',     val:NOTES.filter(n=>n.status==='pending').length,        cls:'text-yellow-700'},
            {label:'Согласовано',   val:NOTES.filter(n=>n.status==='approved').length,       cls:'text-green-700'},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className={`text-xl font-bold ${s.cls}`}>{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="gov-card p-2 mb-3 flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="gov-input pl-7" placeholder="Поиск по номеру, теме..."
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="flex gap-1 flex-wrap">
            {['all','draft','pending','approved'].map(s=>(
              <button key={s} onClick={()=>setSf(s)}
                className={`gov-btn gov-btn-sm ${sf===s?'gov-btn-primary':'gov-btn-ghost'}`}>
                {{all:'Все',draft:'Черновики',pending:'На рассмотрении',approved:'Согласованные'}[s as 'all']}
              </button>
            ))}
          </div>
        </div>

        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Тема</th>
                  <th>Автор</th>
                  <th>Подразделение</th>
                  <th>Адресат</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th>Закупка</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(n=>(
                  <tr key={n.id}>
                    <td className="text-xs font-bold font-mono text-blue-600">{n.number}</td>
                    <td className="text-xs">{n.title}</td>
                    <td className="text-xs font-bold">{n.author}</td>
                    <td className="text-xs text-gray-500">{n.dept}</td>
                    <td className="text-xs">{n.addressee}</td>
                    <td className="text-xs text-gray-500">{formatDate(n.date)}</td>
                    <td><span className={`gov-badge ${ST[n.status].cls}`}>{ST[n.status].label}</span></td>
                    <td>
                      <Link href={`/zakupki/${n.procId}`}
                        className="text-xs text-blue-600 hover:underline font-mono">
                        →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 border-t bg-gray-50 text-xs text-gray-400">
            Показано: {filtered.length} из {NOTES.length}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
