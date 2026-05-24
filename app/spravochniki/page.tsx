'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
const REFS=[
  {name:'ОКПД2',desc:'Общероссийский классификатор продукции по видам экономической деятельности',link:'https://classifikators.ru/okpd'},
  {name:'КТРУ',desc:'Каталог товаров, работ, услуг для государственных и муниципальных нужд',link:'https://zakupki.gov.ru/epz/ktru/'},
  {name:'КБК 2026',desc:'Коды бюджетной классификации Российской Федерации на 2026 год',link:'https://minfin.gov.ru'},
  {name:'КОСГУ',desc:'Классификация операций сектора государственного управления',link:'https://minfin.gov.ru'},
  {name:'ЕИС',desc:'Единая информационная система в сфере закупок',link:'https://zakupki.gov.ru'},
  {name:'ЕАТ «Берёзка»',desc:'Единый агрегатор торговли для закупок у единственного поставщика',link:'https://agregatoreat.ru'},
  {name:'Реестр НДП',desc:'Реестр недобросовестных поставщиков ЕИС',link:'https://zakupki.gov.ru/epz/dishonestsupplier/'},
];
export default function SpravochnikiPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Справочники'}]}/>
        <h1 className="text-base font-bold mb-4">Нормативно-справочная информация</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REFS.map(r=>(
            <a key={r.name} href={r.link} target="_blank" rel="noopener noreferrer" className="gov-card p-3 hover:border-blue-400 hover:shadow-sm transition-all block">
              <div className="text-sm font-bold text-blue-600 mb-1">{r.name}</div>
              <div className="text-xs text-gray-500">{r.desc}</div>
              <div className="text-xs text-blue-400 mt-1">{r.link}</div>
            </a>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
