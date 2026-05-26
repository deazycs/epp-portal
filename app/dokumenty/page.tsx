'use client';
import { useState, useRef } from 'react';
import { Search, Upload, Download, Eye, FileText } from 'lucide-react';
import { useAppStore } from '@/store/index';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { formatDate, truncate } from '@/lib/utils';

const DOCS = [
  { id:'d1', name:'Договор РЗ-2026-00142/Д с ООО ТехноОфис', file:'Договор_РЗ-2026-00142.pdf', cat:'dogovor', status:'approved', size:'912 КБ', date:'2026-04-18', author:'Болдина А.В.', proc:'РЗ-2026-00142' },
  { id:'d2', name:'Техническое задание — картриджи 2026', file:'ТЗ_картриджи_2026.docx', cat:'tz', status:'approved', size:'148 КБ', date:'2026-04-05', author:'Швецов К.Е.', proc:'РЗ-2026-00142' },
  { id:'d3', name:'Счёт-фактура № 112 от 18.04.2026', file:'СФ_112_ТехноОфис.pdf', cat:'schet', status:'proverka_doc', size:'98 КБ', date:'2026-05-02', author:'Пикинер О.В.', proc:'РЗ-2026-00142' },
  { id:'d4', name:'Договор РЗ-2026-00098/Д с ООО МоскваСофт', file:'Договор_РЗ-2026-00098.pdf', cat:'dogovor', status:'approved', size:'845 КБ', date:'2026-02-10', author:'Болдина А.В.', proc:'РЗ-2026-00098' },
  { id:'d5', name:'Акт приёмки — Microsoft 365 (50 лицензий)', file:'Акт_Microsoft365.pdf', cat:'acceptance_act', status:'approved', size:'220 КБ', date:'2026-04-28', author:'Митусов С.А.', proc:'РЗ-2026-00098' },
  { id:'d6', name:'ТЗ — СМЭВ-адаптер для ГИС ЕГРН (черновик)', file:'ТЗ_СМЭВ_адаптер_v1.docx', cat:'tz', status:'draft', size:'92 КБ', date:'2026-05-16', author:'Митусов С.А.', proc:'РЗ-2026-00203' },
  { id:'d7', name:'Служебная записка — запрос на уборку', file:'СЗ_уборка_3кв2026.docx', cat:'service_note', status:'approved', size:'58 КБ', date:'2026-05-15', author:'Давыдова Ф.А.', proc:'РЗ-2026-00178' },
  { id:'d8', name:'Обоснование НМЦК — серверное оборудование', file:'НМЦК_серверы_2026.docx', cat:'obosnovanie', status:'approved', size:'175 КБ', date:'2026-02-20', author:'Митусов С.А.', proc:'РЗ-2026-00089' },
  { id:'d9', name:'Договор РЗ-2026-00056/Д с ЗАО КанцЛайф', file:'Договор_РЗ-2026-00056.pdf', cat:'dogovor', status:'approved', size:'678 КБ', date:'2026-01-28', author:'Болдина А.В.', proc:'РЗ-2026-00056' },
  { id:'d10', name:'Шаблон ТЗ (товары, типовой)', file:'Шаблон_ТЗ_товары.docx', cat:'shablon_doc', status:'approved', size:'52 КБ', date:'2026-01-10', author:'Болдина А.В.', proc:'' },
];

const CAT: Record<string,string> = { tz:'Тех. задание', contract:'Договор', invoice:'Счёт/СФ', acceptance_act:'Акт приёмки', service_note:'Служебная записка', justification:'Обоснование', template:'Шаблон', other:'Прочее' };
const ST_CLR: Record<string,string> = { draft:'bg-gray-100 text-gray-600 border-gray-300', review:'bg-yellow-50 text-yellow-700 border-yellow-300', approved:'bg-green-50 text-green-700 border-green-300', rejected:'bg-red-50 text-red-700 border-red-300' };
const ST_LBL: Record<string,string> = { draft:'Черновик', review:'На проверке', approved:'Утверждён', rejected:'Отклонён' };
const EXT_ICO: Record<string,string> = { pdf:'📕', docx:'📘', xlsx:'📗' };
function fIcon(f:string){ return EXT_ICO[f.split('.').pop()??'']??'📄'; }

export default function DokumentyPage() {
  const { procurements } = useAppStore();
  // Документы = сводный список из всех закупок (requiredDocuments по этапам)
  const docsFromProcurements = procurements.flatMap(p =>
    (p.workflowSteps ?? [])
      .filter(s => s.isCompleted && s.requiredDocuments)
      .flatMap(s => (s.requiredDocuments ?? []).map(doc => ({
        id: `doc-${p.id}-${s.status}-${doc.slice(0,10)}`,
        name: doc,
        procurement: p.registryNumber,
        procId: p.id,
        status: 'approved',
        date: s.completedAt ?? p.updatedAt,
        author: s.completedByName ?? p.responsibleName,
        category: 'contract',
      })))
  ).slice(0, 30); // показываем не более 30
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedDocs, setUploadedDocs] = useState<{id:string;name:string;cat:string;status:string;date:string;size:string;author:string}[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newDocs = files.map(f => ({
      id: `ud-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
      name: f.name,
      cat: 'contract',
      status: 'draft',
      date: new Date().toLocaleDateString('ru-RU'),
      size: f.size > 1024*1024 ? `${(f.size/1024/1024).toFixed(1)} МБ` : `${Math.round(f.size/1024)} КБ`,
      author: 'Швецов К.Е.',
    }));
    setUploadedDocs(prev => [...prev, ...newDocs]);
    e.target.value = '';
  };

  const [search,setSearch]=useState('');
  const [cat,setCat]=useState('all');
  const [status,setStatus]=useState('all');
  const filtered = DOCS.filter(d=> {
    const okS=!search||d.name.toLowerCase().includes(search.toLowerCase())||d.file.toLowerCase().includes(search.toLowerCase());
    const okC=cat==='all'||d.cat===cat;
    const okSt=status==='all'||d.status===status;
    return okS&&okC&&okSt;
  });

  return (
    <AppLayout>
      <div className="p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Документы'}]} />
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Документы и электронный архив</h1>
            <p className="text-xs text-gray-500">Документов: {DOCS.length}</p>
          </div>
          <>
            <input ref={fileRef as any} type="file" multiple className="hidden"
              accept=".pdf,.doc,.docx,.xlsx" onChange={handleUpload}/>
            <button onClick={() => fileRef.current?.click()}
              className="gov-btn gov-btn-secondary gov-btn-sm">
              <Upload size={12}/> Загрузить
            </button>
          </>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            {label:'Договоры', val:DOCS.filter(d=>d.cat==='dogovor').length},
            {label:'Тех. задания', val:DOCS.filter(d=>d.cat==='tz').length},
            {label:'Акты', val:DOCS.filter(d=>d.cat==='acceptance_act').length},
            {label:'На проверке', val:DOCS.filter(d=>d.status==='proverka_doc').length},
          ].map(s=>(
            <div key={s.label} className="gov-card p-2 text-center">
              <div className="text-xl font-bold text-gray-700">{s.val}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="gov-card p-2 mb-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="gov-input pl-7" placeholder="Поиск..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="gov-select w-40" value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="all">Все категории</option>
            {Object.entries(CAT).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
          <select className="gov-select w-36" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="all">Все статусы</option>
            {Object.entries(ST_LBL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr><th>Документ</th><th>Категория</th><th>Статус</th><th>Дата</th><th>Загружен</th><th>Закупка</th><th>Действия</th></tr>
              </thead>
              <tbody>
                {filtered.map(doc=>(
                  <tr key={doc.id}>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{fIcon(doc.file)}</span>
                        <div>
                          <div className="text-xs font-bold text-gray-800">{truncate(doc.name,45)}</div>
                          <div className="text-xs font-mono text-gray-400">{doc.file} · {doc.size}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border">{CAT[doc.cat]}</span></td>
                    <td><span className={`gov-badge ${ST_CLR[doc.status]}`}>{ST_LBL[doc.status]}</span></td>
                    <td className="text-xs">{formatDate(doc.date)}</td>
                    <td className="text-xs font-bold">{doc.author}</td>
                    <td className="text-xs font-mono text-blue-600">{doc.proc||<span className="text-gray-400 italic">Шаблон</span>}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="gov-btn gov-btn-ghost gov-btn-sm py-0"><Eye size={11}/></button>
                        <button className="gov-btn gov-btn-ghost gov-btn-sm py-0"><Download size={11}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-1.5 border-t bg-gray-50 text-xs text-gray-400">Показано: {filtered.length} из {DOCS.length}</div>
        </div>
      </div>
    </AppLayout>
  );
}
