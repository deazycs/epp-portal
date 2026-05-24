'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { Download, Eye } from 'lucide-react';

const T=[
  {id:'t1',name:'Техническое задание (товары)',file:'ТЗ_товары.docx',cat:'tz',size:'52 КБ',upd:'2026-01-10',uses:18},
  {id:'t2',name:'Техническое задание (услуги)',file:'ТЗ_услуги.docx',cat:'tz',size:'56 КБ',upd:'2026-01-10',uses:12},
  {id:'t3',name:'Служебная записка — запрос закупки',file:'СЗ_запрос.docx',cat:'note',size:'40 КБ',upd:'2026-02-01',uses:35},
  {id:'t4',name:'Обоснование НМЦК',file:'НМЦК_обоснование.docx',cat:'obosnovanie',size:'48 КБ',upd:'2026-01-15',uses:15},
  {id:'t5',name:'Проект договора поставки',file:'Договор_поставки.docx',cat:'dogovor',size:'130 КБ',upd:'2026-03-01',uses:9},
  {id:'t6',name:'Проект договора услуг',file:'Договор_услуги.docx',cat:'dogovor',size:'122 КБ',upd:'2026-03-01',uses:6},
  {id:'t7',name:'Акт приёмки-передачи (товары)',file:'Акт_товары.docx',cat:'act',size:'44 КБ',upd:'2026-01-20',uses:24},
  {id:'t8',name:'Акт оказанных услуг',file:'Акт_услуги.docx',cat:'act',size:'40 КБ',upd:'2026-01-20',uses:11},
  {id:'t9',name:'Внутренний реестр закупок',file:'Реестр_закупок.xlsx',cat:'registry',size:'92 КБ',upd:'2026-04-01',uses:3},
];
const CAT: Record<string,string>={tz:'Тех. задание',note:'Служебная записка',justification:'Обоснование НМЦК',contract:'Проект договора',act:'Акт',registry:'Реестр'};
const CLR: Record<string,string>={tz:'bg-blue-50 text-blue-700 border-blue-200',note:'bg-yellow-50 text-yellow-700 border-yellow-200',justification:'bg-purple-50 text-purple-700 border-purple-200',contract:'bg-green-50 text-green-700 border-green-200',act:'bg-teal-50 text-teal-700 border-teal-200',registry:'bg-orange-50 text-orange-700 border-orange-200'};

export default function ShablonyPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Шаблоны документов'}]}/>
        <h1 className="text-base font-bold mb-1">База шаблонов документов</h1>
        <p className="text-xs text-gray-500 mb-4">Типовые документы МТО · {T.length} шаблонов</p>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead><tr><th>Шаблон</th><th>Категория</th><th>Файл</th><th>Размер</th><th>Обновлён</th><th className="text-center">Использований</th><th>Действия</th></tr></thead>
            <tbody>
              {T.map(t=>(
                <tr key={t.id}>
                  <td><div className="flex items-center gap-1.5"><span className="text-base">{t.file.endsWith('.xlsx')?'📗':'📘'}</span><span className="text-xs font-bold">{t.name}</span></div></td>
                  <td><span className={`gov-badge ${CLR[t.cat]}`}>{CAT[t.cat]}</span></td>
                  <td className="text-xs font-mono text-gray-500">{t.file}</td>
                  <td className="text-xs text-gray-500">{t.size}</td>
                  <td className="text-xs text-gray-500">{t.upd}</td>
                  <td className="text-center text-xs font-bold text-blue-700">{t.uses}</td>
                  <td><div className="flex gap-1"><button className="gov-btn gov-btn-ghost gov-btn-sm py-0"><Eye size={11}/></button><button className="gov-btn gov-btn-secondary gov-btn-sm py-0 text-xs"><Download size={11}/> Скачать</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="gov-alert gov-alert-info mt-3 text-xs"><span>ℹ</span><span>Шаблоны предназначены для подготовки типовых документов. Перед использованием проверьте актуальность версии. Юридически значимые документы оформляются в установленном порядке.</span></div>
      </div>
    </AppLayout>
  );
}
