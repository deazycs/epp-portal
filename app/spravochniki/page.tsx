'use client';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { ExternalLink, Search, ChevronDown, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

const KBK_LIST = [
  { code:'321 0113 4590100002 244', name:'Закупка товаров (расходные материалы, канцтовары)', kosgu:'340,344' },
  { code:'321 0113 4590100002 242', name:'Закупка товаров в сфере ИТ (оборудование, ПО)', kosgu:'226,310' },
  { code:'321 0113 4590100002 225', name:'Услуги по содержанию имущества (уборка, ТО)', kosgu:'225,226' },
  { code:'321 0113 4590100002 310', name:'Увеличение стоимости ОС (мебель, оборудование)', kosgu:'310' },
  { code:'321 0113 4590100002 226', name:'Прочие работы и услуги (ИТ-услуги, разработка)', kosgu:'226' },
];

const OKPD_LIST = [
  { code:'26.20.16', name:'Картриджи для принтеров и МФУ', unit:'шт.' },
  { code:'26.20.15', name:'Серверы и системы хранения данных', unit:'шт.' },
  { code:'26.20.22', name:'СХД (системы хранения данных)', unit:'шт.' },
  { code:'21.20.24', name:'Бумага офисная А4, А3', unit:'пач./кор.' },
  { code:'31.01.11', name:'Мебель офисная (столы, стулья, шкафы)', unit:'шт.' },
  { code:'58.29.29', name:'Программное обеспечение (лицензии)', unit:'лиц.' },
  { code:'81.21', name:'Услуги по уборке помещений', unit:'м²/мес.' },
  { code:'43.22', name:'Техническое обслуживание лифтов', unit:'усл.' },
];

const REFS = [
  { name:'ЕИС закупки', url:'https://zakupki.gov.ru', desc:'Единая информационная система в сфере закупок', category:'Площадки' },
  { name:'ЕАТ «Берёзка»', url:'https://agregatoreat.ru', desc:'Единый агрегатор торговли', category:'Площадки' },
  { name:'Сбербанк-АСТ', url:'https://sberbank-ast.ru', desc:'Электронная торговая площадка', category:'Площадки' },
  { name:'ОКПД2', url:'https://classifikators.ru/okpd', desc:'Классификатор продукции по видам деятельности', category:'Классификаторы' },
  { name:'КТРУ', url:'https://zakupki.gov.ru/epz/ktru/', desc:'Каталог товаров, работ, услуг', category:'Классификаторы' },
  { name:'Реестр НДП', url:'https://zakupki.gov.ru/epz/dishonestsupplier/', desc:'Реестр недобросовестных поставщиков', category:'Реестры' },
  { name:'ЕГРЮЛ', url:'https://egrul.nalog.ru', desc:'Проверка контрагента по ИНН', category:'Реестры' },
  { name:'КБК 2026', url:'https://minfin.gov.ru', desc:'Коды бюджетной классификации', category:'Финансы' },
];

export default function SpravochnikiPage() {
  const [tab, setTab]     = useState('kbk');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>(['Площадки']);

  const filteredKBK  = KBK_LIST.filter(k => !search || k.code.includes(search) || k.name.toLowerCase().includes(search.toLowerCase()));
  const filteredOKPD = OKPD_LIST.filter(k => !search || k.code.includes(search) || k.name.toLowerCase().includes(search.toLowerCase()));

  const categories = Array.from(new Set(REFS.map(r => r.category)));
  const toggleCat  = (cat: string) => setExpanded(e => e.includes(cat) ? e.filter(c=>c!==cat) : [...e, cat]);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Справочники'}]}/>
        <h1 className="text-base font-bold mb-3">Нормативно-справочная информация</h1>

        <div className="gov-card p-1.5 flex gap-1 mb-3 flex-wrap">
          {[{k:'kbk',label:'КБК 2026'},{k:'okpd',label:'ОКПД2'},{k:'refs',label:'Внешние ресурсы'}].map(t=>(
            <button key={t.k} onClick={()=>{setTab(t.k);setSearch('');}} className={`gov-btn gov-btn-sm ${tab===t.k?'gov-btn-primary':'gov-btn-ghost'}`}>{t.label}</button>
          ))}
        </div>

        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input className="gov-input pl-8 text-sm" placeholder="Поиск по коду или наименованию..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {tab === 'kbk' && (
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title">Коды бюджетной классификации (КБК) — 2026</div>
            <table className="gov-table">
              <thead><tr><th>Код КБК</th><th>Наименование расходов</th><th>КОСГУ</th></tr></thead>
              <tbody>
                {filteredKBK.map(k=>(
                  <tr key={k.code}>
                    <td className="font-mono text-xs text-blue-700 font-bold">{k.code}</td>
                    <td className="text-xs">{k.name}</td>
                    <td className="text-xs font-mono">{k.kosgu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'okpd' && (
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title">Коды ОКПД2 — часто используемые в МТО</div>
            <table className="gov-table">
              <thead><tr><th>Код ОКПД2</th><th>Наименование</th><th>Ед. изм.</th></tr></thead>
              <tbody>
                {filteredOKPD.map(k=>(
                  <tr key={k.code}>
                    <td className="font-mono text-xs text-blue-700 font-bold">{k.code}</td>
                    <td className="text-xs">{k.name}</td>
                    <td className="text-xs text-gray-500">{k.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'refs' && (
          <div className="space-y-2">
            {categories.map(cat=>(
              <div key={cat} className="gov-card overflow-hidden">
                <button onClick={()=>toggleCat(cat)} className="gov-section-title w-full flex items-center justify-between hover:bg-gray-100 transition-colors">
                  <span>{cat}</span>
                  {expanded.includes(cat) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                </button>
                {expanded.includes(cat) && (
                  <div className="divide-y divide-gray-100">
                    {REFS.filter(r=>r.category===cat).map(r=>(
                      <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="text-xs font-bold text-blue-600">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.desc}</div>
                        </div>
                        <ExternalLink size={13} className="text-gray-400 flex-shrink-0 ml-2"/>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
