'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import { Printer } from 'lucide-react';

export const dynamic = 'force-dynamic';

const FUNCTIONS = [
  { num:'1', name:'Регистрация и ведение реестра закупок', desc:'Создание, редактирование, поиск и фильтрация закупок. Хранение полной истории изменений.' },
  { num:'2', name:'Сопровождение закупочных процедур', desc:'Поддержка 14-этапного workflow от служебной записки до архива. Три типа процедур: ЕАТ «Берёзка», ЕИС+Сбер-АСТ, единственный поставщик.' },
  { num:'3', name:'Контроль сроков и дедлайнов', desc:'Автоматические уведомления о приближающихся и просроченных дедлайнах. Светофор контрольных дат.' },
  { num:'4', name:'Управление задачами и согласованиями', desc:'Назначение задач исполнителям, контроль исполнения, цепочки согласования с фиксацией решений.' },
  { num:'5', name:'Ведение реестра договоров', desc:'Учёт заключённых договоров, контроль исполнения и сроков оплаты.' },
  { num:'6', name:'Аналитика и отчётность', desc:'Динамика закупок, экономия бюджета, KPI специалистов. Экспорт данных в CSV.' },
  { num:'7', name:'Управление поставщиками', desc:'Реестр поставщиков с историей закупок, проверка на соответствие требованиям.' },
  { num:'8', name:'Глобальный поиск', desc:'Полнотекстовый поиск по закупкам, договорам, поставщикам и задачам одновременно.' },
  { num:'9', name:'Уведомления', desc:'Система автоматических уведомлений о событиях: согласования, просрочки, изменения статусов.' },
  { num:'10', name:'Журнал действий', desc:'Полная фиксация всех действий пользователей с датой, временем и IP-адресом.' },
];

const INTEGRATIONS = [
  { name:'ЕАТ «Берёзка»', url:'agregatoreat.ru', basis:'Постановление Правительства РФ от 31.01.2017 № 117', status:'Поддерживается' },
  { name:'ЕИС (zakupki.gov.ru)', url:'zakupki.gov.ru', basis:'44-ФЗ ст. 4', status:'Поддерживается' },
  { name:'Сбербанк-АСТ', url:'sberbank-ast.ru', basis:'44-ФЗ ст. 59-71', status:'Поддерживается' },
  { name:'СМЭВ 3.0', url:'smev.gosuslugi.ru', basis:'Постановление Правительства РФ от 08.09.2010 № 697', status:'Планируется' },
  { name:'Казначейство (СУФД)', url:'sufd.id.gov.ru', basis:'Приказ Казначейства от 29.12.2012 № 24н', status:'Поддерживается' },
];

const LEGAL = [
  '44-ФЗ от 05.04.2013 «О контрактной системе в сфере закупок»',
  'Постановление Правительства РФ от 31.01.2017 № 117 — об ЕАТ «Берёзка»',
  'Постановление Правительства РФ от 11.12.2014 № 1352 — об особенностях закупок у СМП',
  'Приказ Минфина РФ № 21н от 06.03.2019 — КБК и КОСГУ',
  'Приказ Федерального казначейства № 206н от 15.12.2021',
];

export default function PasportPage() {
  const { procurements, tasks } = useAppStore();
  const active = procurements.filter(p => !['archive','cancelled'].includes(p.status));
  const totalSum = procurements.reduce((s,p) => s+p.plannedSum, 0);
  const economy = procurements.reduce((s,p) => s+(p.plannedSum-(p.contractSum??p.plannedSum)), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[
          {label:'Рабочий стол',href:'/dashboard'},
          {label:'Паспорт системы'},
        ]}/>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-base font-bold">Паспорт системы</h1>
          <button onClick={handlePrint}
            className="gov-btn gov-btn-ghost gov-btn-sm">
            <Printer size={12}/> Распечатать
          </button>
        </div>

        {/* Шапка паспорта */}
        <div className="gov-card mb-4 overflow-hidden">
          <div className="p-6" style={{background:'linear-gradient(135deg,#001e5e 0%,#003087 100%)'}}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-blue-700">ЕПП</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight mb-1">
                  Единый портал поставок (ЕПП)
                </h2>
                <p className="text-blue-200 text-sm mb-2">
                  Внутренняя автоматизированная система сопровождения закупок малого объёма
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Росреестр','ЕИС · ЕАТ «Берёзка»','44-ФЗ','Версия 3.0'].map(tag=>(
                    <span key={tag} className="text-xs px-2 py-0.5 bg-white bg-opacity-20 text-white rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Живые счётчики */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {[
              {label:'Закупок в реестре', val:procurements.length},
              {label:'Активных закупок', val:active.length},
              {label:'Общая сумма', val:formatCurrency(totalSum)},
              {label:'Экономия', val:formatCurrency(economy)},
            ].map(s=>(
              <div key={s.label} className="p-4 text-center">
                <div className="text-xl font-bold text-blue-700">{s.val}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Общие сведения */}
          <div className="gov-card">
            <div className="gov-section-title">📋 Общие сведения</div>
            <div className="p-4 space-y-2">
              {[
                {label:'Полное наименование', val:'Единый портал поставок (ЕПП) — внутренняя система сопровождения закупок малого объёма Росреестра'},
                {label:'Сокращённое наименование', val:'ЕПП'},
                {label:'Организация-заказчик', val:'Федеральная служба государственной регистрации, кадастра и картографии (Росреестр)'},
                {label:'Подразделение', val:'Отдел материально-технического обеспечения (МТО)'},
                {label:'Назначение', val:'Автоматизация процессов планирования, размещения и сопровождения закупок малого объёма через ЕАТ «Берёзка» и ЕИС'},
                {label:'Версия', val:'3.0'},
                {label:'Дата создания', val:'2026 год'},
                {label:'Тип системы', val:'Веб-приложение (Next.js 14, React 18)'},
                {label:'Режим работы', val:'Круглосуточно, 7 дней в неделю'},
                {label:'Пользователи', val:'Специалисты МТО, согласующие подразделения, руководство'},
              ].map(r=>(
                <div key={r.label} className="flex gap-3 pb-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-500 flex-shrink-0 w-40">{r.label}</span>
                  <span className="text-xs font-bold text-gray-800 flex-1">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Пользователи системы */}
          <div className="space-y-4">
            <div className="gov-card">
              <div className="gov-section-title">👥 Пользователи системы</div>
              <div className="p-4">
                <table className="gov-table">
                  <thead><tr><th>Роль</th><th>Подразделение</th><th>Доступ</th></tr></thead>
                  <tbody>
                    {[
                      {role:'Специалист МТО',dept:'Отдел МТО',access:'Полный'},
                      {role:'Начальник МТО',dept:'Отдел МТО',access:'Полный'},
                      {role:'Контрактный управляющий',dept:'МТО',access:'Полный'},
                      {role:'Зам. руководителя',dept:'Руководство',access:'Просмотр + согласование'},
                      {role:'Начальник ФЭО',dept:'ФЭО',access:'Финансовые модули'},
                      {role:'Правовой отдел',dept:'Юридический',access:'Документы + согласование'},
                    ].map(u=>(
                      <tr key={u.role}>
                        <td className="text-xs font-bold">{u.role}</td>
                        <td className="text-xs text-gray-500">{u.dept}</td>
                        <td><span className={`gov-badge ${u.access==='Полный'?'bg-green-50 text-green-700 border-green-300':'bg-blue-50 text-blue-700 border-blue-300'}`}>{u.access}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Правовое основание */}
            <div className="gov-card">
              <div className="gov-section-title">⚖️ Правовое основание</div>
              <div className="p-3 space-y-1.5">
                {LEGAL.map((l,i)=>(
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                    <span className="text-blue-500 flex-shrink-0 font-bold">{i+1}.</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Функциональный состав */}
        <div className="gov-card mb-4">
          <div className="gov-section-title">⚙️ Функциональный состав</div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {FUNCTIONS.map(f=>(
              <div key={f.num} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {f.num}
                </span>
                <div>
                  <div className="text-xs font-bold text-gray-800">{f.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Интеграции */}
        <div className="gov-card mb-4">
          <div className="gov-section-title">🔌 Интеграции с внешними системами</div>
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr><th>Система</th><th>Адрес</th><th>Правовое основание</th><th>Статус</th></tr>
              </thead>
              <tbody>
                {INTEGRATIONS.map(i=>(
                  <tr key={i.name}>
                    <td className="text-xs font-bold">{i.name}</td>
                    <td className="text-xs font-mono text-blue-600">{i.url}</td>
                    <td className="text-xs text-gray-500">{i.basis}</td>
                    <td>
                      <span className={`gov-badge ${i.status==='Поддерживается'?'bg-green-50 text-green-700 border-green-300':'bg-yellow-50 text-yellow-700 border-yellow-300'}`}>
                        {i.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Технические характеристики */}
        <div className="gov-card">
          <div className="gov-section-title">💻 Технические характеристики</div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {label:'Платформа', val:'Next.js 14.2 / React 18'},
              {label:'Язык разработки', val:'TypeScript 5.4'},
              {label:'Стиль', val:'Tailwind CSS 3.4'},
              {label:'Графики', val:'Recharts 2.12'},
              {label:'Управление состоянием', val:'Zustand 4.5'},
              {label:'Хранилище данных', val:'localStorage (браузер)'},
              {label:'Развёртывание', val:'Vercel / любой Node.js сервер'},
              {label:'Браузеры', val:'Chrome 90+, Firefox 88+, Edge 90+'},
              {label:'Мобильные устройства', val:'Поддерживается'},
              {label:'Печать', val:'Поддерживается (A4)'},
              {label:'Экспорт данных', val:'CSV (UTF-8 + BOM)'},
              {label:'Авторизация', val:'Внутренняя (демо-режим)'},
            ].map(t=>(
              <div key={t.label} className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs text-gray-500">{t.label}</span>
                <span className="text-xs font-bold text-gray-800">{t.val}</span>
              </div>
            ))}
          </div>
          <div className="px-4 pb-3 text-xs text-gray-400 text-right">
            Паспорт сформирован: {new Date().toLocaleDateString('ru-RU', {day:'2-digit',month:'long',year:'numeric'})}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
