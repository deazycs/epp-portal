'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { ExternalLink, BookOpen, Database, Search, Shield } from 'lucide-react';
import { KBK_LIST } from '@/mock/data/users';

export const dynamic = 'force-dynamic';

const LINKS = [
  { name:'ЕАТ «Берёзка»',           url:'https://agregatoreat.ru',              icon:'🌲', desc:'Закупки малого объёма (п.4 ч.1 ст.93 44-ФЗ). Размещение и мониторинг закупок до 600 тыс. руб.' },
  { name:'ЕИС (zakupki.gov.ru)',     url:'https://zakupki.gov.ru',              icon:'🏛', desc:'Единая информационная система в сфере закупок. Размещение планов-графиков, извещений, отчётов.' },
  { name:'Реестр НДП (РНП)',         url:'https://reestr.zakupki.gov.ru',       icon:'⛔', desc:'Реестр недобросовестных поставщиков. Проверка перед заключением контракта обязательна.' },
  { name:'ОКПД 2 (классификатор)',   url:'https://classifikator.ru/okpd2',      icon:'📋', desc:'Общероссийский классификатор продукции по видам экономической деятельности.' },
  { name:'Приказ №567 (НМЦК)',       url:'https://consultant.ru',               icon:'📊', desc:'Приказ Минэкономразвития №567 от 02.10.2013 — методика определения и обоснования НМЦК.' },
  { name:'Сбербанк-АСТ (ЕИС)',      url:'https://sberbank-ast.ru',             icon:'💼', desc:'Электронная площадка для аукционов и конкурсов свыше 600 тыс. руб.' },
  { name:'Официальный сайт 44-ФЗ',  url:'https://consultant.ru/document/cons_doc_LAW_144624/', icon:'⚖', desc:'Федеральный закон от 05.04.2013 №44-ФЗ «О контрактной системе» — актуальная редакция.' },
  { name:'ФЭО России',      url:'https://roskazna.gov.ru',             icon:'🏦', desc:'Федеральное ФЭО. Исполнение бюджета, ЛБО, лицевые счета.' },
];

const KOSGU: Record<string,string> = {
  '221':'Услуги связи',
  '222':'Транспортные услуги',
  '223':'Коммунальные услуги',
  '224':'Аренда имущества',
  '225':'Содержание имущества (ТО, уборка, охрана)',
  '226':'Прочие работы и услуги (ИТ, обучение)',
  '310':'Основные средства (ОС) — компьютеры, серверы',
  '320':'Нематериальные активы — лицензии ПО',
  '341':'Лекарственные препараты',
  '344':'Расходные материалы (картриджи, канцтовары)',
  '346':'Прочие материальные запасы',
  '347':'Материалы для капвложений',
  '349':'Прочие материалы (одноразовое потребление)',
};

export default function SpravochnikiPage() {
  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{label:'Рабочий стол',href:'/dashboard'},{label:'Справочники'}]}/>

        <div className="mb-4">
          <h1 className="text-base font-bold">Справочники и внешние ресурсы</h1>
          <p className="text-xs text-gray-500">КБК, КОСГУ, ссылки на федеральные системы</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* КБК */}
          <div className="gov-card overflow-hidden">
            <div className="gov-section-title flex items-center gap-2">
              <Database size={13}/> КБК — Росреестр, Управление по Воронежской области
            </div>
            <div className="divide-y divide-gray-50">
              {KBK_LIST.map((kbk, i) => (
                <div key={i} className="p-3">
                  <div className="text-xs font-mono font-bold text-blue-700 mb-0.5">{kbk.code}</div>
                  <div className="text-xs font-bold text-gray-800 mb-1">{kbk.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {kbk.kosguNames.map((kg, j) => (
                      <span key={j} className="text-xs px-1.5 py-0.5 rounded"
                        style={{background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe'}}>
                        {kg}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* КОСГУ */}
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title flex items-center gap-2">
                <BookOpen size={13}/> КОСГУ — коды операций сектора госуправления
              </div>
              <div className="p-3">
                <div className="space-y-1.5">
                  {Object.entries(KOSGU).map(([code, name]) => (
                    <div key={code} className="flex items-start gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 w-8 flex-shrink-0 mt-0.5">{code}</span>
                      <span className="text-xs text-gray-700">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Внешние ресурсы */}
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title flex items-center gap-2">
                <ExternalLink size={13}/> Федеральные системы и нормативная база
              </div>
              <div className="divide-y divide-gray-50">
                {LINKS.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors group">
                    <span className="text-lg flex-shrink-0">{link.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-blue-600 group-hover:underline">{link.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-snug">{link.desc}</div>
                    </div>
                    <ExternalLink size={11} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors"/>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
