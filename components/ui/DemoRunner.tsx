'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, X, ChevronRight, ChevronLeft, CheckCircle, BookOpen } from 'lucide-react';
import { useAppStore } from '@/store/index';
import type { ProcurementStatus } from '@/types';

/* ─────────────────────────────────────────
   ШАГИ ОБЪЕДИНЁННОГО ТУРА
───────────────────────────────────────── */
interface TourStep {
  route: string;
  title: string;
  section: string;
  what: string;       // Что показываем
  why: string;        // Зачем это нужно
  action?: string;    // Что система делает сама
  tip?: string;       // Подсказка для докладчика
  newStatus?: ProcurementStatus;
  duration: number;
}

const STEPS: TourStep[] = [
  {
    route: '/dashboard',
    section: 'Рабочий стол',
    title: '📊 Рабочий стол — центр управления',
    what: 'Главная страница ЕПП объединяет все данные отдела в одном месте: KPI, финансы, активные закупки, риски, задачи и уведомления.',
    why: 'Специалист МТО начинает день с рабочего стола и сразу видит что требует внимания. Красные плитки — критично, оранжевые — срочно.',
    tip: 'Обратите внимание на счётчик экономии бюджета — он считается автоматически из реестра.',
    duration: 7000,
  },
  {
    route: '/zakupki',
    section: 'Реестр закупок',
    title: '📋 Реестр закупок — все процедуры в одном месте',
    what: 'Единый реестр закупок МТО: фильтрация по статусу и подразделению, сортировка по любому полю, экспорт в CSV, печать на А4.',
    why: 'Раньше данные хранились в нескольких таблицах Excel. Теперь всё в одном реестре — поиск занимает секунды вместо получаса.',
    tip: 'Нажмите «Статусы» и выберите «Исполнение» — реестр мгновенно отфильтруется. Ссылку с фильтром можно скопировать.',
    duration: 7000,
  },
  {
    route: '/zakupki/novaya',
    section: 'Создание закупки',
    title: '🆕 Создание новой закупки',
    what: 'Форма создания: выбор процедуры (ЕАТ «Берёзка», ЕИС+Сбер-АСТ или единственный поставщик), позиции с автоматическим расчётом НМЦК, чек-лист готовности.',
    why: 'Система сразу формирует правильный workflow из 14 этапов под выбранную процедуру. Специалист не может пропустить обязательный шаг.',
    tip: 'При выборе процедуры справа появляется список обязательных документов — ТЗ, КП, обоснование НМЦК.',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    section: 'Карточка закупки',
    title: '📄 Карточка закупки — полное досье',
    what: '10 вкладок с исчерпывающей информацией: общие сведения, 14-этапный workflow, позиции, документы, финансы, поставщик, согласования, риски, комментарии, история.',
    why: 'Весь жизненный цикл закупки виден в одном месте. Кнопка перехода на следующий этап фиксирует дату, время и ответственного.',
    tip: 'Зелёная кнопка вверху — переход на следующий этап. Вкладка «История» фиксирует каждое действие.',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    section: 'Workflow',
    title: '⚡ Workflow: закупка переходит к оплате',
    what: 'Система автоматически переводит закупку «Поставка картриджей» на этап «Оплата». Поставка получена, документы подписаны приёмочной комиссией.',
    why: 'Каждый переход фиксируется в истории с датой, временем и именем сотрудника. Бухгалтерия получает уведомление автоматически.',
    action: 'Система меняет статус: Исполнение → Оплата',
    newStatus: 'payment',
    duration: 6000,
  },
  {
    route: '/kontrol-srokov',
    section: 'Контроль сроков',
    title: '⏰ Контроль сроков — светофор дедлайнов',
    what: 'Три зоны: 🔴 просрочено, 🟠 критично (до 5 дней), 🟡 требует внимания. Все контрольные даты по договорам, платежам и размещению в ЕИС.',
    why: 'При открытии системы автоматически проверяются все дедлайны. Предупреждение появляется за 5 дней — специалист успевает подготовиться.',
    duration: 6000,
  },
  {
    route: '/soglasovaniya',
    section: 'Согласования',
    title: '✅ Согласования — цепочка виз',
    what: 'Цепочки согласования с указанием этапов, ответственных и сроков. Кнопки «Согласовать» и «Отклонить» прямо в карточке.',
    why: 'По 44-ФЗ договор требует виз ФЭО, правового отдела и заместителя руководителя. Система контролирует порядок и сроки каждого согласования.',
    tip: 'Нажмите «Согласовать» — статус изменится и инициатор получит уведомление.',
    duration: 6000,
  },
  {
    route: '/zadachi',
    section: 'Задачи',
    title: '✅ Задачи — контроль поручений',
    what: 'Задачи по закупкам с исполнителями, приоритетами и сроками. Создаются вручную или автоматически при согласованиях.',
    why: 'Начальник МТО видит нагрузку каждого специалиста. Счётчик в меню обновляется при каждом выполнении.',
    tip: 'Нажмите «Выполнить» на любой задаче — счётчик в боковом меню изменится мгновенно.',
    duration: 6000,
  },
  {
    route: '/analitika',
    section: 'Аналитика',
    title: '📊 Аналитика — данные в реальном времени',
    what: 'Динамика закупок по месяцам, распределение по статусам, топ поставщиков по сумме, бюджет по подразделениям. Все графики интерактивны.',
    why: 'Данные берутся из актуального реестра — только что изменили статус закупки, и это уже отразилось в графиках.',
    tip: 'Наведите на столбец — появится точная сумма. Откройте вкладку «Бюджет» — увидите распределение по КБК.',
    duration: 7000,
  },
  {
    route: '/kpi',
    section: 'KPI',
    title: '🎯 KPI — ключевые показатели эффективности',
    what: 'Доля закупок в срок, экономия бюджета, среднее время согласования. KPI каждого специалиста МТО с прогресс-барами.',
    why: 'Руководство видит объективные показатели работы отдела без субъективных оценок.',
    duration: 6000,
  },
  {
    route: '/rukovoditel',
    section: 'Панель руководителя',
    title: '👔 Панель руководителя',
    what: 'Специальный вид для Заместителя руководителя: нагрузка специалистов, проблемные закупки, распределение бюджета, сотрудники на рабочем месте.',
    why: 'Руководитель видит полную картину в двух кликах от главной страницы без необходимости запрашивать отчёты у специалистов.',
    duration: 7000,
  },
  {
    route: '/pasport',
    section: 'Паспорт системы',
    title: '📄 Паспорт системы — для комиссии',
    what: 'Официальный документ: назначение системы, правовое основание (44-ФЗ), 10 функций, пользователи, интеграции с ЕАТ/ЕИС/Сбер-АСТ/Казначейством.',
    why: 'Нажмите «Распечатать» — документ формируется на А4 и может быть передан членам комиссии прямо сейчас.',
    tip: 'Страница оптимизирована для печати. Нажмите «Распечатать» вверху справа.',
    duration: 7000,
  },
  {
    route: '/about',
    section: 'Экономический эффект',
    title: '💡 Экономический эффект внедрения ЕПП',
    what: 'Конкретные цифры: ~3 часа экономии в день на специалиста, сокращение ошибок на 80%, поиск документов в 180 раз быстрее, экономия бюджета — живой счётчик.',
    why: 'ЕПП — это не демонстрационный прототип, а реально внедряемая система. Все показатели рассчитаны на основе реальной работы отдела МТО.',
    duration: 7000,
  },
];

const SESS_STEP    = 'epp_tour2_step';
const SESS_PLAYING = 'epp_tour2_playing';

/* ─────────────────────────────────────────
   КОМПОНЕНТ
───────────────────────────────────────── */
export function DemoRunner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { changeStatus } = useAppStore();

  const [step, setStep] = useState(() =>
    typeof window !== 'undefined' ? Number(sessionStorage.getItem(SESS_STEP) ?? 0) : 0
  );
  const [playing, setPlaying] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(SESS_PLAYING) === 'true' : false
  );
  const [done, setDone]     = useState(false);
  const [showToc, setShowToc] = useState(false);
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef             = useRef(step);
  stepRef.current = step;

  const cur    = STEPS[step] ?? STEPS[0];
  const isLast = step === STEPS.length - 1;
  const pct    = Math.round(((step + 1) / STEPS.length) * 100);

  useEffect(() => { sessionStorage.setItem(SESS_STEP, String(step)); }, [step]);
  useEffect(() => { sessionStorage.setItem(SESS_PLAYING, String(playing)); }, [playing]);

  const navigate = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const goTo = useCallback((target: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const s = STEPS[target];
    if (s.newStatus) changeStatus('p001', s.newStatus, 'u1', 'Петров А.В.');
    setStep(target);
    setShowToc(false);
    navigate(s.route);
  }, [changeStatus, navigate]);

  const goNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const cur = stepRef.current;
    if (cur >= STEPS.length - 1) {
      setDone(true); setPlaying(false);
      sessionStorage.removeItem(SESS_STEP);
      sessionStorage.removeItem(SESS_PLAYING);
      return;
    }
    const next = cur + 1;
    const s = STEPS[next];
    if (STEPS[cur].newStatus) changeStatus('p001', STEPS[cur].newStatus!, 'u1', 'Петров А.В.');
    setStep(next);
    navigate(s.route);
  }, [changeStatus, navigate]);

  const goPrev = useCallback(() => {
    if (step === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const prev = step - 1;
    setStep(prev);
    navigate(STEPS[prev].route);
  }, [step, navigate]);

  // Авто-таймер
  useEffect(() => {
    if (!playing || done) return;
    timerRef.current = setTimeout(goNext, cur.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, done, step, goNext, cur.duration]);

  // Клавиатура
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') { if (showToc) setShowToc(false); else handleClose(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    sessionStorage.removeItem(SESS_STEP);
    sessionStorage.removeItem(SESS_PLAYING);
    onClose();
  };

  return (
    <>
      {/* Затемнение */}
      <div className="fixed inset-0 z-[9970] pointer-events-none"
        style={{ background: 'rgba(0,0,20,0.25)' }} />

      {/* Оглавление */}
      {showToc && (
        <div className="fixed inset-0 z-[9985]" onClick={() => setShowToc(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Содержание</span>
              <button onClick={() => setShowToc(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14}/>
              </button>
            </div>
            <div className="p-2">
              {STEPS.map((s, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left mb-0.5 transition-colors ${
                    i === step ? 'bg-blue-600 text-white' :
                    i < step  ? 'text-green-700 hover:bg-green-50' :
                                'text-gray-600 hover:bg-gray-50'
                  }`}>
                  <span className="text-xs flex-shrink-0">
                    {i < step ? '✓' : i === step ? '▶' : `${i + 1}`}
                  </span>
                  <span className="text-xs font-medium truncate">{s.section}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Панель снизу */}
      <div className="fixed inset-x-0 bottom-0 z-[9990]">
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-blue-600 transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>

        <div className="bg-white border-t-2 border-blue-600 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 py-3">
            {done ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="text-sm font-bold text-gray-800">Демонстрация завершена!</div>
                    <div className="text-xs text-gray-500">
                      Показано {STEPS.length} разделов · Полный цикл закупки от СЗ до архива
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { goTo(0); setDone(false); setPlaying(false); }}
                    className="gov-btn gov-btn-ghost gov-btn-sm">🔄 Сначала</button>
                  <button onClick={handleClose} className="gov-btn gov-btn-primary gov-btn-sm">
                    <CheckCircle size={13}/> Завершить
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {step + 1} / {STEPS.length} · {cur.section}
                    </span>
                    <div className="h-1.5 flex-1 min-w-16 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                    {playing && <span className="text-xs text-orange-500 animate-pulse">⏱ авто</span>}
                  </div>

                  <div className="text-sm font-bold text-gray-900 mb-1">{cur.title}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">
                    <span className="font-semibold text-gray-700">Что: </span>{cur.what}
                  </div>
                  <div className="text-xs text-blue-700 leading-relaxed mt-0.5">
                    <span className="font-semibold">Зачем: </span>{cur.why}
                  </div>
                  {cur.action && (
                    <div className="text-xs text-green-700 mt-0.5 font-medium">
                      ⚡ {cur.action}
                    </div>
                  )}
                  {cur.tip && (
                    <div className="text-xs text-amber-700 mt-0.5">
                      💡 {cur.tip}
                    </div>
                  )}
                </div>

                {/* Кнопки */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={goPrev} disabled={step === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100">
                      <ChevronLeft size={16}/>
                    </button>

                    <button onClick={() => setPlaying(p => !p)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                        playing ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}>
                      {playing ? <><Pause size={13}/> Пауза</> : <><Play size={13}/> Авто</>}
                    </button>

                    <button onClick={goNext}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors">
                      {isLast ? <><CheckCircle size={14}/> Готово</> : <>Далее <ChevronRight size={14}/></>}
                    </button>

                    <button onClick={() => setShowToc(t => !t)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                      title="Содержание тура">
                      <BookOpen size={15}/>
                    </button>

                    <button onClick={handleClose}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <X size={14}/>
                    </button>
                  </div>

                  {/* Точки */}
                  <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === step ? 'w-4 h-2 bg-blue-600' :
                          i < step   ? 'w-2 h-2 bg-green-400 hover:scale-110' :
                                       'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!done && (
              <div className="mt-1.5 text-center">
                <span className="text-xs text-gray-300">
                  ← → стрелки · Enter — далее · 📋 оглавление · Esc — закрыть
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Кнопка запуска ─────────────────────── */
export function DemoButton({
  variant = 'ghost',
}: {
  variant?: 'primary' | 'ghost' | 'floating';
}) {
  const start = () => window.dispatchEvent(new Event('epp:demo:run'));

  if (variant === 'floating') {
    return (
      <button onClick={start}
        className="fixed bottom-6 right-6 z-[9960] flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
        title="Запустить демонстрацию системы">
        <Play size={16}/>
        <span className="text-sm font-bold">▶ Демо</span>
      </button>
    );
  }

  return (
    <button onClick={start}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}>
      <Play size={11}/> Демо
    </button>
  );
}
