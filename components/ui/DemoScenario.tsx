'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, X, ChevronRight, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/index';
import { WORKFLOW_STATUS_LABELS } from '@/lib/constants';
import type { ProcurementStatus } from '@/types';

/* ─── Шаги ──────────────────────────────── */
interface Step {
  route: string;
  title: string;
  what: string;
  why: string;
  newStatus?: ProcurementStatus;
  duration: number;
}

const STEPS: Step[] = [
  {
    route: '/dashboard',
    title: '📊 Рабочий стол ЕПП',
    what: 'Перед вами рабочий стол Единого портала поставок Росреестра.',
    why: 'Специалист МТО видит все активные закупки, просрочки, задачи и уведомления в одном месте. Никаких таблиц Excel.',
    duration: 5000,
  },
  {
    route: '/zakupki',
    title: '📋 Реестр закупок',
    what: 'Все закупки отдела в одном реестре с фильтрами и поиском.',
    why: 'Специалист видит статус каждой закупки, поставщика, сумму и срок. Фильтры сохраняются в ссылке — можно поделиться с коллегой.',
    duration: 5000,
  },
  {
    route: '/zakupki/p001',
    title: '📄 Карточка закупки',
    what: 'Открываем карточку закупки «Поставка картриджей» — 10 вкладок с полной информацией.',
    why: 'Документы, финансы, поставщик, согласования, история изменений — всё в одном месте. Статус меняется кнопкой.',
    duration: 6000,
  },
  {
    route: '/zakupki/p001',
    title: '💰 Переход к оплате',
    what: 'Система переводит закупку на этап «Оплата». Поставка получена, документы подписаны.',
    why: 'Каждый переход фиксируется в истории с датой и именем. Бухгалтерия получает уведомление автоматически.',
    newStatus: 'payment',
    duration: 5000,
  },
  {
    route: '/zakupki/p001',
    title: '🗄️ Архивирование',
    what: 'Закупка завершена и переходит в архив.',
    why: 'Архив хранит документы 5 лет по требованиям 44-ФЗ. Всё доступно для проверки в любой момент.',
    newStatus: 'archive',
    duration: 5000,
  },
  {
    route: '/kontrol-srokov',
    title: '⏰ Контроль сроков',
    what: 'Светофор дедлайнов: красные — просрочено, оранжевые — критично, жёлтые — внимание.',
    why: 'Система автоматически создаёт уведомления за 5 дней до срока. Ни одна просрочка не останется незамеченной.',
    duration: 5000,
  },
  {
    route: '/analitika',
    title: '📊 Аналитика',
    what: 'Динамика закупок, распределение по статусам, топ поставщиков.',
    why: 'Все графики строятся из актуального реестра в реальном времени. Руководство видит полную картину.',
    duration: 5000,
  },
  {
    route: '/rukovoditel',
    title: '👔 Панель руководителя',
    what: 'Специальный вид для руководства — нагрузка специалистов и проблемные закупки.',
    why: 'Руководитель видит кто чем занят, что требует внимания и как распределён бюджет по подразделениям.',
    duration: 5000,
  },
  {
    route: '/about',
    title: '✅ Экономический эффект',
    what: 'Итоги внедрения ЕПП с конкретными цифрами.',
    why: '~3 часа экономии в день, сокращение ошибок на 80%, поиск в 180 раз быстрее. ЕПП — реальный инструмент МТО.',
    duration: 6000,
  },
];

/* ─── Компонент ──────────────────────────── */
export function DemoScenario({ onClose }: { onClose: () => void }) {
  const { changeStatus } = useAppStore();
  const [step, setStep]     = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone]     = useState(false);
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef             = useRef(step);
  stepRef.current = step;

  const cur    = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const pct    = Math.round(((step + 1) / STEPS.length) * 100);

  // Навигация через window.location — надёжнее чем router в этом контексте
  const navigateTo = useCallback((route: string) => {
    if (window.location.pathname !== route) {
      window.location.href = route;
    }
  }, []);

  // При монтировании — идём на первый шаг
  useEffect(() => {
    navigateTo(STEPS[0].route);
  }, []);

  const goNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const currentStep = stepRef.current;

    if (currentStep >= STEPS.length - 1) {
      setDone(true);
      setPlaying(false);
      return;
    }

    const next = STEPS[currentStep + 1];

    // Выполняем действие текущего шага
    if (STEPS[currentStep].newStatus) {
      changeStatus('p001', STEPS[currentStep].newStatus!, 'u1', 'Петров А.В.');
    }

    setStep(currentStep + 1);

    // Переходим на страницу следующего шага
    navigateTo(next.route);
  }, [changeStatus, navigateTo]);

  // Авто-таймер
  useEffect(() => {
    if (!playing || done) return;
    timerRef.current = setTimeout(() => {
      goNext();
    }, cur.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, done, step, goNext, cur.duration]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] pointer-events-none">
      {/* Прогресс */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-1 bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="bg-white border-t-2 border-blue-600 shadow-2xl pointer-events-auto">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {done ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">Демонстрация завершена!</div>
                  <div className="text-xs text-gray-500">Система ЕПП показала полный цикл закупки</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setStep(0); setDone(false); setPlaying(false); navigateTo('/dashboard'); }}
                  className="gov-btn gov-btn-ghost gov-btn-sm"
                >
                  🔄 Начать сначала
                </button>
                <button onClick={handleClose} className="gov-btn gov-btn-primary gov-btn-sm">
                  <CheckCircle size={13} /> Завершить
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {/* Текст */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {step + 1} / {STEPS.length}
                  </span>
                  <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-1.5 bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="text-sm font-bold text-gray-900 mb-1">{cur.title}</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold text-gray-700">Что: </span>{cur.what}
                </div>
                <div className="text-xs text-blue-700 leading-relaxed mt-0.5">
                  <span className="font-semibold">Зачем: </span>{cur.why}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                <button
                  onClick={() => setPlaying(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    playing
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {playing ? <><Pause size={13} /> Пауза</> : <><Play size={13} /> Авто</>}
                </button>

                <button
                  onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
                >
                  {isLast ? <><CheckCircle size={14} /> Готово</> : <>Далее <ChevronRight size={14} /></>}
                </button>

                <button onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {!done && (
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-300">
                «Далее» — следующий шаг · «Авто» — автопоказ каждые 5 сек · X — закрыть
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Кнопка ─────────────────────────────── */
export function DemoScenarioButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
      >
        <Play size={11} /> Демо-сценарий
      </button>
      {open && <DemoScenario onClose={() => setOpen(false)} />}
    </>
  );
}
