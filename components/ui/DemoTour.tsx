'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  X, ChevronRight, ChevronLeft, Play, CheckCircle,
  LayoutDashboard, ShoppingCart, FileText, Clock,
  CheckSquare, Bell, Calendar, BarChart3, Star,
  Search, Info, BookOpen, Map
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   СТРУКТУРА ШАГОВ
───────────────────────────────────────────────────────── */
interface Step {
  id: string;
  section: string;           // название раздела в оглавлении
  icon: React.ReactNode;
  title: string;
  body: string;
  route: string;
  tip?: string;
  badge?: string;            // «Новое», «Ключевое» и т.д.
}

const STEPS: Step[] = [
  {
    id:'welcome',
    section:'Введение',
    icon:<Map size={14}/>,
    title:'Добро пожаловать в ЕПП',
    body:'ЕПП — Единый портал поставок Росреестра. Система объединяет весь цикл закупок: от служебной записки до архивирования. Поддерживает ЕИС и ЕАТ «Берёзка».',
    route:'/dashboard',
    badge:'Старт',
  },
  {
    id:'dashboard',
    section:'Рабочий стол',
    icon:<LayoutDashboard size={14}/>,
    title:'Рабочий стол — центр управления',
    body:'Здесь всё важное сразу: KPI, финансы, просрочки, риски, лента активности. Данные берутся из реального реестра и обновляются мгновенно при любом изменении.',
    route:'/dashboard',
    tip:'Обратите внимание на красные плитки вверху — они требуют немедленного внимания.',
    badge:'Ключевое',
  },
  {
    id:'registry',
    section:'Реестр закупок',
    icon:<ShoppingCart size={14}/>,
    title:'Реестр закупок',
    body:'Все закупки в одном месте. Фильтрация по статусу и подразделению, сортировка по любому полю, экспорт в CSV. Фильтры сохраняются в адресной строке — можно поделиться ссылкой.',
    route:'/zakupki',
    tip:'Нажмите кнопку «Статусы» и выберите «Исполнение» — реестр отфильтруется мгновенно.',
  },
  {
    id:'card',
    section:'Карточка закупки',
    icon:<FileText size={14}/>,
    title:'Карточка закупки — главный модуль',
    body:'Полное досье: 10 вкладок с данными, документами, финансами, согласованиями. Зелёная кнопка вверху двигает закупку по этапам workflow. Комментарии и история сохраняются.',
    route:'/zakupki/p001',
    tip:'Нажмите зелёную кнопку «→ …» в шапке карточки. Затем откройте вкладку «История» — появится запись.',
    badge:'Ключевое',
  },
  {
    id:'create',
    section:'Создание закупки',
    icon:<ShoppingCart size={14}/>,
    title:'Создание новой закупки',
    body:'Форма с выбором площадки (ЕАТ «Берёзка» или ЕИС), позициями и автоматическим расчётом суммы. Чек-лист показывает заполненность. После сохранения закупка сразу появляется в реестре.',
    route:'/zakupki/novaya',
    tip:'Введите название, добавьте позицию с ценой — сумма посчитается сама. Нажмите «На согласование».',
  },
  {
    id:'deadlines',
    section:'Контроль сроков',
    icon:<Clock size={14}/>,
    title:'Контроль сроков — светофор',
    body:'Три зоны: красные — просрочено, оранжевые — критично (до 5 дней), жёлтые — требуют внимания. Охватывает договоры, платежи и размещение в ЕИС. При открытии системы дедлайны проверяются автоматически.',
    route:'/kontrol-srokov',
    badge:'Авто',
  },
  {
    id:'approvals',
    section:'Согласования',
    icon:<CheckSquare size={14}/>,
    title:'Согласования',
    body:'Цепочки согласования с этапами, сроками и статусами. Кнопки «Согласовать» и «Отклонить» прямо в карточке. При каждом решении создаётся уведомление инициатору.',
    route:'/soglasovaniya',
    tip:'Нажмите «Согласовать» — статус изменится и уведомление появится в колоколе.',
  },
  {
    id:'tasks',
    section:'Задачи',
    icon:<CheckSquare size={14}/>,
    title:'Управление задачами',
    body:'Задачи по закупкам с исполнителями, приоритетами и сроками. Кнопка «Выполнить» мгновенно меняет статус и обновляет счётчики в боковом меню. Экспорт в CSV.',
    route:'/zadachi',
    tip:'Нажмите «Выполнить» на любой задаче — счётчик в левом меню обновится сразу.',
  },
  {
    id:'notifications',
    section:'Уведомления',
    icon:<Bell size={14}/>,
    title:'Уведомления',
    body:'Автоматические уведомления о просрочках, согласованиях, задачах. При открытии системы проверяются все дедлайны и создаются предупреждения за 5 дней. Прочитать всё одной кнопкой.',
    route:'/uvedomleniya',
    badge:'Авто',
  },
  {
    id:'calendar',
    section:'Календарь',
    icon:<Calendar size={14}/>,
    title:'Календарь контрольных дат',
    body:'Визуальная сетка всех дат: сроки договоров, платежей, согласований. Навигация по месяцам. Ближайшие события справа. Каждое событие кликабельно — ведёт в карточку.',
    route:'/kalendar',
  },
  {
    id:'analytics',
    section:'Аналитика и KPI',
    icon:<BarChart3 size={14}/>,
    title:'Аналитика и KPI',
    body:'Динамика по месяцам, распределение по статусам и подразделениям, топ поставщиков. KPI показывает долю выполнения в срок, экономию и нагрузку специалистов.',
    route:'/analitika',
    tip:'Наведите на столбец графика — увидите точную сумму. Всё считается из реального реестра.',
  },
  {
    id:'manager',
    section:'Панель руководителя',
    icon:<Star size={14}/>,
    title:'Панель руководителя',
    body:'Специальный вид для руководства: нагрузка специалистов, проблемные закупки, распределение бюджета по подразделениям и KPI отдела.',
    route:'/rukovoditel',
    badge:'Для Е.П.',
  },
  {
    id:'search',
    section:'Поиск',
    icon:<Search size={14}/>,
    title:'Глобальный поиск',
    body:'Поиск одновременно по закупкам, договорам, поставщикам и задачам. Результаты сгруппированы по типам. Находит в том числе закупки созданные прямо сейчас.',
    route:'/poisk',
    tip:'Введите «Картриджи» или «ООО ТехноОфис» и нажмите Найти.',
  },
  {
    id:'about',
    section:'О системе',
    icon:<Info size={14}/>,
    title:'Экономический эффект',
    body:'Страница с конкретными цифрами: ~3 часа экономии в день, сокращение ошибок на 80%, поиск в 180× быстрее. Живые счётчики из реестра и сравнение «до и после».',
    route:'/about',
  },
  {
    id:'finish',
    section:'Завершение',
    icon:<CheckCircle size={14}/>,
    title:'Тур завершён!',
    body:'Вы познакомились со всеми ключевыми модулями ЕПП. Данные сохраняются в браузере. Для сброса к исходным данным — кнопка «Демо-сброс» на рабочем столе.',
    route:'/dashboard',
    badge:'Готово',
  },
];

const BADGE_COLORS: Record<string,string> = {
  'Старт':    'bg-blue-100 text-blue-700',
  'Ключевое': 'bg-amber-100 text-amber-700',
  'Авто':     'bg-green-100 text-green-700',
  'Для Е.П.': 'bg-purple-100 text-purple-700',
  'Готово':   'bg-green-100 text-green-700',
};

/* ─────────────────────────────────────────────────────────
   ОСНОВНОЙ КОМПОНЕНТ
───────────────────────────────────────────────────────── */
export function DemoTour({ onClose }: { onClose: () => void }) {
  const handleClose = () => {
    sessionStorage.removeItem('epp_tour_step');
    onClose();
  };
  const router   = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return Number(sessionStorage.getItem('epp_tour_step') ?? 0);
  });
  const [busy, setBusy]       = useState(false);
  const [visible, setVisible] = useState(false);

  // Сохраняем шаг тура в sessionStorage чтобы выжить при навигации
  useEffect(() => {
    sessionStorage.setItem('epp_tour_step', String(step));
  }, [step]);
  const [showToc, setShowToc] = useState(false);

  const cur    = STEPS[step];
  const isFirst = step === 0;
  const isLast  = step === STEPS.length - 1;
  const pct     = Math.round(((step + 1) / STEPS.length) * 100);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const go = useCallback(async (target: number) => {
    if (busy) return;
    setBusy(true);
    setShowToc(false);
    const next = STEPS[target];
    if (next.route !== pathname) {
      router.push(next.route);
      await new Promise(r => setTimeout(r, 500));
    }
    setStep(target);
    setBusy(false);
  }, [busy, pathname, router]);

  const handleNext = () => isLast ? handleClose() : go(step + 1);
  const handlePrev = () => { if (!isFirst) go(step - 1); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'Escape') { if (showToc) setShowToc(false); else onClose(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  return (
    <>
      {/* ── Тонкое затемнение фона ── */}
      <div className="fixed inset-0 z-[9970] pointer-events-none"
        style={{ background:'rgba(0,0,20,0.28)', opacity: visible ? 1 : 0, transition:'opacity .3s' }} />

      {/* ── Оглавление (TOC drawer) ── */}
      {showToc && (
        <div className="fixed inset-0 z-[9980]" onClick={() => setShowToc(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ transition:'transform .25s', transform: showToc ? 'translateX(0)' : 'translateX(100%)' }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Содержание тура</span>
              <button onClick={() => setShowToc(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14}/>
              </button>
            </div>
            <div className="p-2">
              {STEPS.map((s, i) => (
                <button key={s.id} onClick={() => go(i)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors mb-0.5 ${
                    i === step
                      ? 'bg-blue-600 text-white'
                      : i < step
                        ? 'text-green-700 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className={`flex-shrink-0 ${i === step ? 'text-white' : i < step ? 'text-green-500' : 'text-gray-400'}`}>
                    {i < step ? <CheckCircle size={13}/> : s.icon}
                  </span>
                  <span className="text-xs font-medium flex-1 truncate">{s.section}</span>
                  {s.badge && i !== step && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${BADGE_COLORS[s.badge] ?? 'bg-gray-100 text-gray-500'}`}>
                      {s.badge}
                    </span>
                  )}
                  {i === step && (
                    <span className="text-xs bg-white bg-opacity-25 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                      здесь
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Главная панель — снизу, на всю ширину ── */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-[9990]
        transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}>
        {/* Тонкий цветной индикатор прогресса сверху панели */}
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width:`${pct}%` }} />
        </div>

        <div className="bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-start gap-4">

              {/* ── Левая часть: иконка шага ── */}
              <div className="flex-shrink-0 hidden sm:flex flex-col items-center gap-1 pt-0.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                  isLast ? 'bg-green-500' : 'bg-blue-600'
                }`}>
                  {cur.icon}
                </div>
                <span className="text-xs text-gray-400 font-mono">{step+1}/{STEPS.length}</span>
              </div>

              {/* ── Центральная часть: контент ── */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">{cur.title}</h3>
                  {cur.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${BADGE_COLORS[cur.badge] ?? 'bg-gray-100 text-gray-600'}`}>
                      {cur.badge}
                    </span>
                  )}
                  {busy && (
                    <span className="flex items-center gap-1 text-xs text-blue-400 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"/>
                      переход...
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed mb-2">{cur.body}</p>

                {cur.tip && (
                  <div className="flex items-start gap-2 py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-sm flex-shrink-0">💡</span>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Попробуйте:</strong> {cur.tip}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Правая часть: навигация ── */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                {/* Кнопки Назад / Далее */}
                <div className="flex items-center gap-2">
                  <button onClick={handlePrev} disabled={isFirst||busy}
                    className="flex items-center gap-1 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
                    <ChevronLeft size={13}/> Назад
                  </button>

                  <button onClick={handleNext} disabled={busy}
                    className={`
                      flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-lg
                      transition-all duration-150 disabled:opacity-60 shadow-sm min-w-28 justify-center
                      ${isLast
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                      }
                    `}>
                    {busy
                      ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/></>
                      : isLast
                        ? <><CheckCircle size={14}/> Готово!</>
                        : <>Далее <ChevronRight size={14}/></>
                    }
                  </button>
                </div>

                {/* Точки-шаги */}
                <div className="flex items-center gap-1">
                  {STEPS.map((_, i) => (
                    <button key={i} onClick={() => go(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === step ? 'w-4 h-2 bg-blue-600' :
                        i < step   ? 'w-2 h-2 bg-green-400 hover:scale-110' :
                                     'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Нижние ссылки */}
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowToc(t => !t)}
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline transition-colors">
                    📋 Содержание
                  </button>
                  <span className="text-gray-200">|</span>
                  <button onClick={handleClose}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                    Закрыть тур
                  </button>
                </div>
              </div>
            </div>

            {/* Подсказка клавиатуры */}
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-300">
                ← → стрелки · Enter — далее · Esc — закрыть · Клик на точку — перейти к шагу
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   КНОПКА ЗАПУСКА
───────────────────────────────────────────────────────── */
export function DemoTourButton({
  variant = 'ghost',
  label = 'Демо-тур',
}: {
  variant?: 'primary' | 'ghost' | 'floating';
  label?: string;
}) {
  const startTour = () => window.dispatchEvent(new Event('epp:tour:start'));

  if (variant === 'floating') {
    return (
      <button onClick={startTour}
        className="fixed bottom-6 right-6 z-[9960] flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
        title="Запустить демо-тур по системе">
        <Play size={15}/>
        <span className="text-sm font-bold">{label}</span>
      </button>
    );
  }

  return (
    <button onClick={startTour}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}>
      <Play size={11}/> {label}
    </button>
  );
}
