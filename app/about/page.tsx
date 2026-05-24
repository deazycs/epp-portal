'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/index';
import { DemoButton } from '@/components/ui/DemoRunner';
import { useAppStore } from '@/store/index';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, Clock, FileX, CheckCircle, Users, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const BEFORE = [
  { icon:'📁', label:'Хранение документов', value:'Несколько сетевых папок + локальные диски + email' },
  { icon:'📊', label:'Учёт закупок', value:'Таблицы Excel, обновляемые вручную' },
  { icon:'⏰', label:'Контроль сроков', value:'Бумажные напоминания, личный календарь' },
  { icon:'🔍', label:'Поиск документа', value:'До 30 минут на поиск нужного файла' },
  { icon:'📝', label:'Подготовка отчёта', value:'2–3 часа ручной сборки из разных источников' },
  { icon:'❌', label:'Ошибки данных', value:'Неверные версии файлов, дублирование информации' },
];

const AFTER = [
  { icon:'🗄️', label:'Хранение документов', value:'Единый электронный архив с поиском' },
  { icon:'📋', label:'Учёт закупок', value:'Автоматический реестр, обновляется мгновенно' },
  { icon:'🔔', label:'Контроль сроков', value:'Автоматические уведомления за 3–5 дней' },
  { icon:'⚡', label:'Поиск документа', value:'Менее 10 секунд через глобальный поиск' },
  { icon:'📊', label:'Подготовка отчёта', value:'Экспорт в Excel одной кнопкой' },
  { icon:'✅', label:'Точность данных', value:'Единый источник истины, история изменений' },
];

const METRICS = [
  { label:'Экономия времени специалиста', value:'~3 часа', sub:'в день на рутинных операциях', icon:<Clock size={20}/>, color:'text-blue-700', bg:'bg-blue-50' },
  { label:'Сокращение ошибок', value:'на 80%', sub:'за счёт устранения ручного переноса данных', icon:<FileX size={20}/>, color:'text-green-700', bg:'bg-green-50' },
  { label:'Скорость поиска документов', value:'в 180×', sub:'быстрее чем в папках на сетевом диске', icon:<TrendingDown size={20}/>, color:'text-purple-700', bg:'bg-purple-50' },
  { label:'Экономия рабочего времени', value:'~720 ч/год', sub:'по отделу МТО из 3 специалистов', icon:<Users size={20}/>, color:'text-orange-600', bg:'bg-orange-50' },
];

const INTEGRATIONS = [
  { name:'ЕАТ «Берёзка»', desc:'Запрос котировок, закупки малого объёма до 600 тыс. руб.', status:'Поддерживается', color:'bg-green-100 text-green-700' },
  { name:'ЕИС zakupki.gov.ru', desc:'Конкурентные процедуры, размещение извещений и отчётов', status:'Поддерживается', color:'bg-green-100 text-green-700' },
  { name:'СМЭВ 3.0', desc:'Межведомственное взаимодействие, интеграция с ГИС ЕГРН', status:'В разработке', color:'bg-yellow-100 text-yellow-700' },
  { name:'Казначейство (СУФД)', desc:'Платёжные поручения и финансовые реестры', status:'Поддерживается', color:'bg-green-100 text-green-700' },
];

export default function AboutPage() {
  const { procurements, tasks } = useAppStore();
  const totalSaved = procurements.reduce((s, p) => s + (p.plannedSum - (p.contractSum ?? p.plannedSum)), 0);
  const completed = procurements.filter(p => p.status === 'archive').length;

  return (
    <AppLayout>
      <div className="p-3 sm:p-4">
        <Breadcrumbs items={[{ label:'Рабочий стол', href:'/dashboard' }, { label:'О системе' }]} />

        {/* Герой */}
        <div className="gov-card mb-4 overflow-hidden">
          <div className="p-6 sm:p-8" style={{ background:'linear-gradient(135deg, #001e5e 0%, #003087 60%, #0050b3 100%)' }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-700">ЕПП</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white leading-tight">Единый портал поставок</h1>
                    <p className="text-blue-200 text-sm">Росреестр · Версия 3.0 · 2026</p>
                  </div>
                </div>
                <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
                  Внутренняя система сопровождения закупок, объединяющая работу через
                  ЕИС и ЕАТ «Берёзка» в едином пространстве. Создана для снижения
                  административной нагрузки на специалистов МТО Росреестра.
                </p>
              </div>
              <div className="flex-shrink-0">
                <DemoButton variant="primary" />
              </div>
            </div>
          </div>

          {/* Живые счётчики */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
            {[
              { label:'Закупок в реестре', value:procurements.length, suffix:'' },
              { label:'Завершено успешно', value:completed, suffix:'' },
              { label:'Экономия бюджета', value:formatCurrency(totalSaved), suffix:'' },
              { label:'Задач выполнено', value:tasks.filter(t=>t.status==='done').length, suffix:'' },
            ].map(s => (
              <div key={s.label} className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{s.value}{s.suffix}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Экономический эффект */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">📈 Экономический эффект внедрения</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {METRICS.map(m => (
              <div key={m.label} className={`gov-card p-4 border-l-4 ${m.bg}`} style={{ borderLeftColor: m.color.replace('text-','').includes('blue') ? '#1d4ed8' : m.color.includes('green') ? '#15803d' : m.color.includes('purple') ? '#7e22ce' : '#c2410c' }}>
                <div className={`mb-2 ${m.color}`}>{m.icon}</div>
                <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs font-bold text-gray-700 mt-1">{m.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* До и после */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">🔄 Сравнение: до и после внедрения ЕПП</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title bg-red-50 text-red-700 border-red-100">❌ До внедрения ЕПП</div>
              <div className="divide-y divide-gray-100">
                {BEFORE.map(b => (
                  <div key={b.label} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-base flex-shrink-0 mt-0.5">{b.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{b.label}</div>
                      <div className="text-xs text-red-600 mt-0.5">{b.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="gov-card overflow-hidden">
              <div className="gov-section-title bg-green-50 text-green-700 border-green-100">✅ После внедрения ЕПП</div>
              <div className="divide-y divide-gray-100">
                {AFTER.map(a => (
                  <div key={a.label} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-base flex-shrink-0 mt-0.5">{a.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-gray-800">{a.label}</div>
                      <div className="text-xs text-green-700 mt-0.5">{a.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Интеграции */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-800 mb-3">🔌 Поддерживаемые площадки и системы</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INTEGRATIONS.map(i => (
              <div key={i.name} className="gov-card p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-gray-800">{i.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{i.desc}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-bold flex-shrink-0 ${i.color}`}>{i.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Техническая информация */}
        <div className="gov-card">
          <div className="gov-section-title">ℹ️ Техническая информация</div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            {[
              ['Система', 'ЕПП — Единый портал поставок'],
              ['Версия', '3.0.0'],
              ['Платформа', 'Next.js 14 · React 18 · TypeScript'],
              ['Организация', 'Росреестр'],
              ['Режим', 'Демонстрационный прототип'],
              ['Страниц', '40+'],
              ['Охват', 'ЕИС · ЕАТ «Берёзка» · СМЭВ'],
              ['Данные', 'Хранятся в браузере (localStorage)'],
              ['Мобильная версия', 'Поддерживается'],
              ['Экспорт', 'Excel (XLSX) · CSV · Печать'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-100 py-1.5">
                <span className="text-xs text-gray-500">{k}</span>
                <span className="text-xs font-bold text-gray-700">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
