'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
const INTS=[
  {name:'ЕИС (zakupki.gov.ru)',status:'active',desc:'Единая информационная система. Размещение извещений, публикация контрактов, отчётность.',last:'20.05.2026 08:00'},
  {name:'ЕАТ «Берёзка»',status:'active',desc:'Единый агрегатор торговли. Запросы котировок, малые закупки до 600 тыс. руб.',last:'20.05.2026 07:45'},
  {name:'СМЭВ 3.0',status:'pending',desc:'Система межведомственного электронного взаимодействия. Интеграция с ГИС ЕГРН.',last:'—'},
  {name:'Казначейство (СУФД)',status:'active',desc:'Система удалённого финансового документооборота. Платёжные поручения, реестры.',last:'19.05.2026 17:00'},
  {name:'ГИС ЕГРН',status:'active',desc:'Государственная информационная система ЕГРН. Сведения об объектах недвижимости.',last:'20.05.2026 06:00'},
  {name:'1С:Бухгалтерия',status:'vruchnuyu',desc:'Интеграция в ручном режиме через выгрузку Excel. Автоматизация в планах.',last:'—'},
];
const ST: Record<string,string>={active:'bg-green-50 text-green-700 border-green-300',pending:'bg-yellow-50 text-yellow-700 border-yellow-300',manual:'bg-gray-100 text-gray-600 border-gray-300',error:'bg-red-50 text-red-700 border-red-300'};
const STL: Record<string,string>={active:'✓ Активна',pending:'⏳ Настройка',manual:'Ручной режим',error:'✗ Ошибка'};
export default function IntegraciPage() {
  return (
    <AppLayout>
      <div className="p-4">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Интеграции'}]}/>
        <h1 className="text-base font-bold mb-1">Интеграции</h1>
        <p className="text-xs text-gray-500 mb-4">Подключения к внешним государственным системам и сервисам</p>
        <div className="space-y-2">
          {INTS.map(i=>(
            <div key={i.name} className="gov-card p-3 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-800">{i.name}</span>
                  <span className={`gov-badge ${ST[i.status]}`}>{STL[i.status]}</span>
                </div>
                <div className="text-xs text-gray-500">{i.desc}</div>
                {i.last!=='—'&&<div className="text-xs text-gray-400 mt-1">Последний обмен: {i.last}</div>}
              </div>
              <button className="gov-btn gov-btn-ghost gov-btn-sm flex-shrink-0">Проверить</button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
