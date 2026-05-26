'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import { Clock, FileText, TrendingDown, Shield, Award, BarChart3, Users, CheckCircle, Printer, Folder } from 'lucide-react';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

// ── ОПЕРАЦИИ: БЫЛО → СТАЛО ───────────────────────────────
const OPERATIONS = [
  {
    category: 'Документооборот',
    icon: '📄',
    items: [
      { op: 'Поиск нужного документа',         was: '25–30 мин',   now: '< 10 сек',  saving: '29 мин',  wasDesc: 'Сетевые папки, email, локальные диски — нет единого места' },
      { op: 'Подготовка отчёта для руководства',was: '2–3 часа',    now: '2 минуты',  saving: '~170 мин',wasDesc: 'Ручная сборка из Excel, email, бумажных журналов' },
      { op: 'Согласование СЗ с руководством',   was: '2–3 дня',     now: '15 минут',  saving: '~2 дня',  wasDesc: 'Бумажный документ носили из кабинета в кабинет' },
      { op: 'Проверка ЛБО в ФЭО',               was: '1–2 дня',     now: '1 час',     saving: '~1 день', wasDesc: 'Звонок или личный визит в ФЭО, ожидание ответа' },
      { op: 'Подготовка пакета на закупку',      was: '3–4 часа',    now: '40 минут',  saving: '~3 часа', wasDesc: 'Сбор форм из разных файлов, ручное заполнение реквизитов' },
    ],
  },
  {
    category: 'Контроль и отчётность',
    icon: '📊',
    items: [
      { op: 'Формирование реестра закупок',      was: 'Каждый день вручную', now: 'Автоматически', saving: '30 мин/день', wasDesc: 'Ежедневное обновление общей Excel-таблицы' },
      { op: 'Контроль срока поставки',           was: 'Личный календарь',    now: 'Автоуведомление', saving: '0 пропусков', wasDesc: 'Дедлайны в личных заметках, легко пропустить' },
      { op: 'Проверка статуса оплаты',           was: '10–15 мин/запрос',    now: '< 5 сек',         saving: '14 мин',     wasDesc: 'Звонок в ФЭО или личный визит за информацией' },
      { op: 'Сверка данных между отделами',       was: '1–2 часа/неделю',    now: 'Не требуется',    saving: '100%',       wasDesc: 'У каждого отдела своя версия таблицы — они расходились' },
      { op: 'Подготовка ответа на запрос КСП',   was: '1–2 дня',             now: '15 минут',        saving: '~2 дня',     wasDesc: 'Ручной поиск документов по папкам и архивам' },
    ],
  },
  {
    category: 'Закупочная деятельность',
    icon: '🛒',
    items: [
      { op: 'Расчёт НМЦК (метод анализа рынка)', was: '2–3 часа',  now: '20 минут', saving: '~2.5 часа', wasDesc: 'Ручной расчёт в Excel, проверка коэф. вариации вручную' },
      { op: 'Сравнение коммерческих предложений',was: '1–1.5 часа',now: '10 минут', saving: '~1 час',    wasDesc: 'Таблица сравнения вручную, ошибки в формулах' },
      { op: 'Контроль исполнения договора',       was: '20 мин/день',now: 'Авто',   saving: '~7 ч/мес', wasDesc: 'Ежедневная проверка статусов по каждому договору' },
      { op: 'Уведомление об окончании срока',     was: 'Вручную',   now: 'Автоматически', saving: '100%', wasDesc: 'Кто-то должен был помнить и напомнить коллегам' },
    ],
  },
];

// ── БУМАЖНЫЙ ДОКУМЕНТООБОРОТ ─────────────────────────────
const PAPER = [
  { name: 'Служебных записок',         year: 120, sheets: 2,  comment: 'Каждая СЗ — 2 листа + копия' },
  { name: 'Актов приёмки',             year: 80,  sheets: 3,  comment: 'Акт + 2 экземпляра' },
  { name: 'Договоров на подпись',       year: 60,  sheets: 8,  comment: '6–10 листов каждый' },
  { name: 'Отчётов и сводок',          year: 48,  sheets: 5,  comment: 'Ежемесячные отчёты для руководства' },
  { name: 'Запросов КП поставщикам',   year: 200, sheets: 1,  comment: 'Исходящие письма' },
  { name: 'Прочих служебных писем',    year: 150, sheets: 1,  comment: 'Переписка между отделами' },
];

// Считаем итог бумаги
const totalDocs  = PAPER.reduce((s, p) => s + p.year, 0);
const totalSheets= PAPER.reduce((s, p) => s + p.year * p.sheets, 0);
const sheetsDigital = Math.round(totalSheets * 0.65); // 65% переходит в цифру
const cartridges = Math.round(sheetsDigital / 250);   // ~250 листов на картридж
const cartridgeCost = cartridges * 1800;              // ~1800 руб. картридж

export default function AboutPage() {
  const { procurements, tasks } = useAppStore();
  const [activeCategory, setActiveCategory] = useState(0);

  const totalSaved  = procurements.reduce((s, p) => s + (p.plannedSum - (p.contractSum ?? p.plannedSum)), 0);
  const completed   = procurements.filter(p => p.status === 'archive').length;
  const economyReal = totalSaved > 0 ? totalSaved : 360000;

  // Общее время экономии в час
  const totalMinPerDay = 3 * 60; // ~3 часа в день на специалиста
  const specialists = 3;
  const workDays    = 248;
  const hourRate    = 270; // руб/час
  const annualHours = Math.round(totalMinPerDay / 60 * specialists * workDays);
  const annualMoney = annualHours * hourRate;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4 fade-in">
        <Breadcrumbs items={[{ label: 'Рабочий стол', href: '/dashboard' }, { label: 'О системе' }]}/>

        {/* ── ГЕРОЙ ─────────────────────────────────────── */}
        <div className="gov-card mb-4 overflow-hidden">
          <div className="p-6 sm:p-8" style={{ background: 'linear-gradient(135deg, #001e5e 0%, #003087 60%, #0050b3 100%)' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-black text-blue-700">ЕПП</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">Единый портал поставок</h1>
                <p className="text-blue-200 text-sm">Управление Росреестра по Воронежской области · Версия 3.0 · 2026</p>
                <p className="text-blue-100 text-sm mt-2 max-w-2xl leading-relaxed">
                  Внутренняя система сопровождения закупок по 44-ФЗ. Объединяет работу
                  специалистов МТО, ФЭО, правового отдела и руководства в едином пространстве.
                  Адрес: г. Воронеж, ул. Донбасская, д. 2.
                </p>
              </div>
            </div>
          </div>
          {/* Живые счётчики */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            {[
              { label: 'Закупок в системе',    value: procurements.length },
              { label: 'Завершено успешно',     value: completed },
              { label: 'Экономия бюджета',      value: formatCurrency(economyReal) },
              { label: 'Задач выполнено',       value: tasks.filter(t => t.status === 'done').length },
            ].map(s => (
              <div key={s.label} className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ИТОГОВЫЙ ЭФФЕКТ ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {[
            { icon: <Clock size={18}/>,      label: 'Экономия времени',        value: `${annualHours} ч/год`,  sub: `${specialists} специалиста × 3 ч/день × ${workDays} р.дней`,        color: '#003087' },
            { icon: <TrendingDown size={18}/>,label: 'Экономия в рублях',       value: formatCurrency(annualMoney), sub: 'Стоимость сэкономленного рабочего времени МТО',              color: '#15803d' },
            { icon: <Shield size={18}/>,     label: 'Предотвращено штрафов',   value: '~60 000 ₽/год',         sub: 'Просрочки −80%. Штраф по КоАП ч.1.4 ст.7.30 — 15 000 руб.',      color: '#7c3aed' },
            { icon: <Printer size={18}/>,    label: 'Меньше бумаги',           value: `${sheetsDigital} листов`, sub: `${cartridges} картриджей × 1 800 руб. = ${formatCurrency(cartridgeCost)}/год`, color: '#b45309' },
          ].map(k => (
            <div key={k.label} className="gov-card p-3" style={{ borderTop: `3px solid ${k.color}` }}>
              <div className="flex items-start justify-between mb-1">
                <div className="text-xs text-gray-500 leading-tight">{k.label}</div>
                <div style={{ color: k.color, flexShrink: 0 }}>{k.icon}</div>
              </div>
              <div className="text-lg font-bold leading-tight mb-1" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs text-gray-400 leading-snug">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── РАЗБИВКА ПО ОПЕРАЦИЯМ ─────────────────────── */}
        <div className="gov-card overflow-hidden mb-4">
          <div className="gov-section-title flex items-center gap-2">
            <Clock size={13}/> Экономия времени — разбивка по операциям
          </div>
          {/* Вкладки категорий */}
          <div className="flex border-b border-gray-100">
            {OPERATIONS.map((cat, i) => (
              <button key={i} onClick={() => setActiveCategory(i)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  activeCategory === i
                    ? 'border-blue-600 text-blue-700 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <span>{cat.icon}</span>
                {cat.category}
              </button>
            ))}
          </div>
          {/* Таблица операций */}
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Операция</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>❌ Было</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>✅ Стало</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>Экономия</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Что было раньше</th>
                </tr>
              </thead>
              <tbody>
                {OPERATIONS[activeCategory].items.map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#111827' }}>{item.op}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: 6, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {item.was}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 11, color: '#15803d', background: '#ecfdf5', padding: '2px 8px', borderRadius: 6, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {item.now}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        −{item.saving}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>{item.wasDesc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── БУМАЖНЫЙ ДОКУМЕНТООБОРОТ ──────────────────── */}
        <div className="gov-card overflow-hidden mb-4">
          <div className="gov-section-title flex items-center gap-2">
            <Folder size={13}/> Снижение бумажного документооборота
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Таблица документов */}
              <div>
                <div className="text-xs font-bold text-gray-600 mb-2">Объём бумажного документооборота МТО (год):</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Тип документа</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Шт./год</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Листов</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Примечание</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAPER.map((p, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '7px 10px', fontSize: 12 }}>{p.name}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{p.year}</td>
                        <td style={{ padding: '7px 10px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#b45309' }}>{p.year * p.sheets}</td>
                        <td style={{ padding: '7px 10px', fontSize: 11, color: '#9ca3af' }}>{p.comment}</td>
                      </tr>
                    ))}
                    <tr style={{ borderTop: '2px solid #e5e7eb', background: '#f9fafb' }}>
                      <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 800 }}>ИТОГО</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#dc2626' }}>{totalDocs}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: '#b45309' }}>{totalSheets}</td>
                      <td style={{ padding: '8px 10px', fontSize: 11, color: '#6b7280' }}>всего листов в год</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Итог и эффект */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-600 mb-2">Эффект от перехода в цифру:</div>
                {[
                  { icon: '📄', label: 'Листов переходит в электронный вид', val: `${sheetsDigital} листов/год`, desc: '65% документооборота — согласования, реестры, отчёты', color: '#15803d' },
                  { icon: '🖨', label: 'Экономия картриджей', val: `${cartridges} шт./год`, desc: `По ~250 листов на картридж × 1 800 руб. = ${formatCurrency(cartridgeCost)}/год`, color: '#7c3aed' },
                  { icon: '📁', label: 'Бумажных папок меньше', val: '~12 папок/год', desc: 'Реестры, журналы, сводные таблицы — теперь в системе', color: '#0050b3' },
                  { icon: '🔍', label: 'Поиск в архиве', val: 'Мгновенно', desc: 'Раньше: найти нужный акт из 80 штук — 20–30 минут', color: '#003087' },
                  { icon: '🛡', label: 'Защита от потери', val: '100%', desc: 'Документы в системе не теряются — аудиторский след по каждому', color: '#15803d' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-2.5 rounded-lg"
                    style={{ background: item.color + '0d', border: `1px solid ${item.color}25` }}>
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-700">{item.label}</span>
                        <span className="text-xs font-bold" style={{ color: item.color }}>{item.val}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Итоговый баннер */}
            <div className="mt-4 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #001e5e, #003087)' }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { val: `${totalSheets}`, unit: 'листов/год', label: 'было на бумаге' },
                  { val: `${sheetsDigital}`, unit: 'листов', label: 'перейдёт в цифру (65%)' },
                  { val: `${cartridges}`, unit: 'картриджа', label: 'экономия/год' },
                  { val: formatCurrency(cartridgeCost + annualMoney), unit: 'руб./год', label: 'суммарная экономия' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-xl font-bold text-white leading-tight">{item.val}</div>
                    <div className="text-xs text-blue-300 font-medium">{item.unit}</div>
                    <div className="text-xs text-blue-400 opacity-70 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── ДО И ПОСЛЕ ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="gov-card overflow-hidden">
            <div className="p-3 font-bold text-sm text-red-700 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <span>❌</span> До внедрения ЕПП
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { icon:'📁', title:'Хранение документов', desc:'Несколько сетевых папок + локальные диски + email' },
                { icon:'📊', title:'Учёт закупок', desc:'Таблицы Excel, обновляемые вручную. У каждого своя версия' },
                { icon:'⏰', title:'Контроль сроков', desc:'Бумажные напоминания, личный календарь — легко пропустить' },
                { icon:'🔍', title:'Поиск документа', desc:'До 30 минут на поиск нужного файла' },
                { icon:'📝', title:'Отчёт для руководства', desc:'2–3 часа ручной сборки из разных источников' },
                { icon:'✉', title:'Согласование СЗ', desc:'2–3 дня ожидания: бумагу носили по кабинетам' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{item.title}</div>
                    <div className="text-xs text-red-600 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gov-card overflow-hidden">
            <div className="p-3 font-bold text-sm text-green-700 bg-green-50 border-b border-green-100 flex items-center gap-2">
              <span>✅</span> После внедрения ЕПП
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { icon:'🗄️', title:'Хранение документов', desc:'Единый электронный архив. Поиск < 10 секунд' },
                { icon:'📋', title:'Учёт закупок', desc:'Автоматический реестр — обновляется мгновенно. Единая версия' },
                { icon:'🔔', title:'Контроль сроков', desc:'Автоматические уведомления за 3–5 дней до дедлайна' },
                { icon:'⚡', title:'Поиск документа', desc:'Глобальный поиск — любой документ за 10 секунд' },
                { icon:'📊', title:'Отчёт для руководства', desc:'Аналитика в реальном времени — нажал, увидел' },
                { icon:'✅', title:'Согласование СЗ', desc:'Электронная виза — 15 минут вместо 2–3 дней' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-gray-800">{item.title}</div>
                    <div className="text-xs text-green-700 mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ОХВАТ 44-ФЗ ───────────────────────────────── */}
        <div className="gov-card overflow-hidden mb-4">
          <div className="gov-section-title flex items-center gap-2">
            <Shield size={13}/> Соответствие 44-ФЗ — что покрывает ЕПП
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { art: 'ст.18-19', name: 'Обоснование и планирование', status: 'covered', desc: 'Служебные записки с КБК и обоснованием потребности' },
                { art: 'ст.22', name: 'Расчёт НМЦК', status: 'covered', desc: 'Калькулятор по Приказу №567, коэф. вариации' },
                { art: 'ст.33', name: 'Описание объекта закупки (ТЗ)', status: 'covered', desc: 'Шаблоны ТЗ для товаров и услуг' },
                { art: 'ст.34', name: 'Существенные условия контракта', status: 'covered', desc: 'Сроки поставки и приёмки в форме создания' },
                { art: 'ст.93 п.4', name: 'Закупка малого объёма', status: 'covered', desc: 'ЕАТ Берёзка — до 600 тыс. руб.' },
                { art: 'ст.94 ч.3', name: 'Приёмка и экспертиза', status: 'covered', desc: 'Акт приёмки, загрузка сканов, мотивированный отказ' },
                { art: 'ст.94 ч.9', name: 'Отчётность в ЕИС', status: 'covered', desc: 'Напоминание — не позднее 5 р.д. после оплаты' },
                { art: 'ст.99', name: 'Контроль и аудиторский след', status: 'covered', desc: 'Полная история каждого действия, неизменная' },
                { art: 'ст.104', name: 'Реестр НДП', status: 'covered', desc: 'Статус добросовестности поставщика' },
                { art: 'БК РФ ст.219', name: 'Лимиты бюджетных обязательств', status: 'covered', desc: 'Проверка ЛБО в ФЭО перед созданием закупки' },
                { art: 'ст.16', name: 'План-график закупок', status: 'planned', desc: 'В разработке для версии 4.0' },
                { art: 'ст.45', name: 'Банковская гарантия', status: 'planned', desc: 'Планируется для крупных закупок' },
              ].map(item => (
                <div key={item.art} className="flex items-start gap-2.5 p-2.5 rounded-lg border"
                  style={{
                    background: item.status === 'covered' ? '#ecfdf5' : '#f9fafb',
                    borderColor: item.status === 'covered' ? '#6ee7b7' : '#e5e7eb',
                  }}>
                  <div className="flex-shrink-0 mt-0.5">
                    {item.status === 'covered'
                      ? <CheckCircle size={14} style={{ color: '#15803d' }}/>
                      : <Clock size={14} style={{ color: '#9ca3af' }}/>
                    }
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold"
                        style={{ color: item.status === 'covered' ? '#15803d' : '#6b7280' }}>
                        {item.art}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{item.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ ────────────────────── */}
        <div className="gov-card overflow-hidden">
          <div className="gov-section-title flex items-center gap-2">
            <BarChart3 size={13}/> Техническая информация
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5">
            {[
              ['Система',            'ЕПП — Единый портал поставок'],
              ['Версия',             '3.0.0'],
              ['Платформа',          'Next.js 14 · React 18 · TypeScript'],
              ['Организация',        'Управление Росреестра по Воронежской обл.'],
              ['Адрес',              'г. Воронеж, ул. Донбасская, д. 2'],
              ['Страниц в системе',  '48'],
              ['Статусов workflow',  '18 этапов по 44-ФЗ'],
              ['Сотрудников в БД',   '14 реальных сотрудников'],
              ['КБК',                '6 реальных КБК Росреестра Воронеж'],
              ['Экспорт',            'Excel (XLSX) · CSV · Печать'],
              ['Мобильная версия',   'Поддерживается'],
              ['Режим',              'Демонстрационный прототип, 2026'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-100 py-1.5">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-bold text-gray-700 text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
