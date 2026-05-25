'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { FileText, Download, Eye, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

const TEMPLATES = [
  { id:'t1', name:'Служебная записка на закупку', category:'СЗ', format:'DOCX', desc:'Шаблон СЗ для всех отделов-инициаторов. Содержит: обоснование потребности, наименование, кол-во, сумму, КБК.', law:'ст.18-19 44-ФЗ', updated:'2026-03-01', uses:47 },
  { id:'t2', name:'Заявка на коммерческое предложение', category:'КП', format:'DOCX', desc:'Запрос КП поставщику. Указывается предмет, технические характеристики, срок ответа.', law:'Приказ №567', updated:'2026-01-15', uses:89 },
  { id:'t3', name:'Техническое задание (товары)', category:'ТЗ', format:'DOCX', desc:'Стандартное ТЗ для закупки товаров. ОКПД2, характеристики, требования к упаковке и маркировке.', law:'ст.33 44-ФЗ', updated:'2026-02-10', uses:34 },
  { id:'t4', name:'Техническое задание (услуги)', category:'ТЗ', format:'DOCX', desc:'ТЗ для закупки услуг и работ. Требования к квалификации, срокам, результату.', law:'ст.33 44-ФЗ', updated:'2026-02-10', uses:21 },
  { id:'t5', name:'Акт приёмки товаров (форма 0510452)', category:'Приёмка', format:'DOCX', desc:'Унифицированная форма акта приёмки. Состав комиссии, перечень товаров, заключение.', law:'ч.3 ст.94 44-ФЗ', updated:'2026-01-01', uses:112 },
  { id:'t6', name:'Мотивированный отказ в приёмке', category:'Приёмка', format:'DOCX', desc:'Письмо поставщику об отказе в приёмке с перечнем выявленных недостатков и сроком устранения.', law:'ч.3 ст.94 44-ФЗ', updated:'2026-01-01', uses:8 },
  { id:'t7', name:'Договор поставки товаров (малый объём)', category:'Договор', format:'DOCX', desc:'Типовой договор для закупок по п.4 ч.1 ст.93 (ЕАТ Берёзка). Условия поставки, оплаты, ответственности.', law:'ст.93 44-ФЗ', updated:'2026-03-15', uses:56 },
  { id:'t8', name:'Договор на оказание услуг (малый объём)', category:'Договор', format:'DOCX', desc:'Типовой договор услуг для малого объёма. Включает порядок сдачи-приёмки и штрафные санкции.', law:'ст.93 44-ФЗ', updated:'2026-03-15', uses:29 },
  { id:'t9', name:'Обоснование НМЦК (метод анализа рынка)', category:'НМЦК', format:'DOCX', desc:'Готовый текст обоснования НМЦК для документов закупки. Заполняется по результатам калькулятора.', law:'ст.22 44-ФЗ, Приказ №567', updated:'2026-01-10', uses:67 },
  { id:'t10', name:'Протокол рассмотрения КП', category:'КП', format:'DOCX', desc:'Протокол сравнения коммерческих предложений с указанием победителя и обоснованием выбора.', law:'ст.22 44-ФЗ', updated:'2026-01-10', uses:41 },
];

const CATEGORIES = ['Все', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
const CAT_COLORS: Record<string,string> = {
  'СЗ':      '#3b82f6', 'КП':     '#8b5cf6', 'ТЗ':      '#f59e0b',
  'Приёмка': '#10b981', 'Договор':'#ef4444', 'НМЦК':   '#0ea5e9',
};

export default function ShablonyPage() {
  const [search, setSearch] = useState('');
  const [cat, setCat]       = useState('Все');

  const filtered = TEMPLATES.filter(t => {
    const okS = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const okC = cat === 'Все' || t.category === cat;
    return okS && okC;
  });

  const totalUses = TEMPLATES.reduce((s,t) => s + t.uses, 0);

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Шаблоны документов'}]}/>

        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-base font-bold">Шаблоны документов</h1>
            <p className="text-xs text-gray-500">Типовые формы для всех этапов закупки по 44-ФЗ</p>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label:'Шаблонов',     val: TEMPLATES.length, color:'#003087' },
            { label:'Категорий',    val: CATEGORIES.length - 1, color:'#7c3aed' },
            { label:'Использований',val: totalUses, color:'#059669' },
          ].map(s=>(
            <div key={s.label} className="gov-card p-3 text-center">
              <div className="text-2xl font-bold" style={{color:s.color}}>{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Фильтры */}
        <div className="gov-card p-2 flex gap-2 flex-wrap mb-3">
          <div className="relative flex-1 min-w-32">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input className="gov-input pl-7 text-xs" placeholder="Поиск шаблона..."
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              className={`gov-btn gov-btn-sm ${cat===c?'gov-btn-primary':'gov-btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Сетка шаблонов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(t => (
            <div key={t.id} className="gov-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div style={{ width:36, height:36, borderRadius:8, background:`${CAT_COLORS[t.category]}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FileText size={16} style={{color:CAT_COLORS[t.category]}}/>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-800 leading-snug">{t.name}</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{background:`${CAT_COLORS[t.category]}18`, color:CAT_COLORS[t.category]}}>
                        {t.category}
                      </span>
                      <span className="text-xs text-gray-400">{t.format}</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">{t.desc}</p>

              <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                <span title="Правовое основание" style={{color:'#6366f1'}} className="font-medium">{t.law}</span>
                <span>{t.uses} использ.</span>
              </div>

              <div className="flex gap-1.5">
                <button className="flex-1 gov-btn gov-btn-primary gov-btn-sm justify-center gap-1">
                  <Download size={11}/> Скачать
                </button>
                <button className="gov-btn gov-btn-ghost gov-btn-sm">
                  <Eye size={11}/>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">Шаблоны не найдены</div>
            <div className="empty-state-desc">Попробуйте изменить поисковый запрос или выбрать другую категорию</div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
