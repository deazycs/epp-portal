'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Play, Pause, X, ChevronRight, CheckCircle, SkipForward } from 'lucide-react';
import { useAppStore } from '@/store/index';
import { WORKFLOW_STATUS_LABELS } from '@/lib/constants';
import type { ProcurementStatus } from '@/types';

/* ─── Шаги сценария ─────────────────────── */
interface ScenarioStep {
  id: string;
  route: string;                    // куда перейти
  title: string;                    // заголовок шага
  what: string;                     // что происходит
  why: string;                      // зачем это нужно
  action?: () => void;              // автодействие (смена статуса и т.д.)
  newStatus?: ProcurementStatus;    // новый статус закупки p001
  duration: number;                 // сколько показывать (мс)
}

const PROC_ID = 'p001'; // Закупка для демо

function buildSteps(
  advanceFn: (id: string, userId: string, name: string) => void,
  changeFn: (id: string, status: ProcurementStatus, userId: string, name: string) => void
): ScenarioStep[] {
  const advance = () => advanceFn(PROC_ID, 'u1', 'Петров А.В.');
  const setStatus = (s: ProcurementStatus) => () => changeFn(PROC_ID, s, 'u1', 'Петров А.В.');

  return [
    {
      id: 's0',
      route: '/dashboard',
      title: '📊 Рабочий стол ЕПП',
      what: 'Перед вами рабочий стол Единого портала поставок Росреестра.',
      why: 'Здесь специалист МТО видит все активные закупки, просрочки, задачи и уведомления в одном месте. Никаких таблиц Excel — всё автоматически.',
      duration: 5000,
    },
    {
      id: 's1',
      route: '/zakupki',
      title: '📋 Реестр закупок',
      what: 'Открываем реестр закупок. Все закупки отдела в одном месте.',
      why: 'Специалист видит статус каждой закупки, поставщика, сумму и срок. Можно фильтровать, искать и экспортировать в CSV. Фильтры сохраняются в ссылке.',
      duration: 5000,
    },
    {
      id: 's2',
      route: `/zakupki/${PROC_ID}`,
      title: '📄 Карточка закупки',
      what: 'Открываем карточку закупки «Поставка картриджей». Статус — «Исполнение».',
      why: 'Карточка содержит 10 вкладок: общие сведения, этапы workflow, документы, финансы, поставщик, согласования, риски, комментарии, история.',
      duration: 5000,
    },
    {
      id: 's3',
      route: `/zakupki/${PROC_ID}`,
      title: '💰 Переходим к оплате',
      what: 'Система автоматически переводит закупку на этап «Оплата». Поставка получена, документы подписаны.',
      why: 'Workflow фиксирует каждый переход с датой и именем сотрудника. В истории появляется запись. Уведомление отправляется бухгалтерии.',
      action: setStatus('payment'),
      newStatus: 'payment',
      duration: 5000,
    },
    {
      id: 's4',
      route: `/zakupki/${PROC_ID}`,
      title: '📊 Отчётность в ЕИС',
      what: 'Закупка переходит на этап «Отчётность в ЕИС». Документы на оплату переданы в бухгалтерию.',
      why: 'По 44-ФЗ после исполнения договора нужно разместить отчёт в ЕИС. Система напоминает об этом и фиксирует выполнение.',
      action: setStatus('eis_reporting'),
      newStatus: 'eis_reporting',
      duration: 5000,
    },
    {
      id: 's5',
      route: `/zakupki/${PROC_ID}`,
      title: '🗄️ Закупка в архиве',
      what: 'Закупка завершена и переведена в архив. Полный цикл пройден.',
      why: 'Архив хранит все данные 5 лет согласно требованиям. Документы доступны для проверки в любой момент.',
      action: setStatus('archive'),
      newStatus: 'archive',
      duration: 5000,
    },
    {
      id: 's6',
      route: '/kontrol-srokov',
      title: '⏰ Контроль сроков',
      what: 'Раздел «Контроль сроков» — светофор дедлайнов по всем закупкам.',
      why: 'Красные — просрочено, оранжевые — критично (до 5 дней), жёлтые — внимание. Система автоматически создаёт уведомления за 5 дней до срока.',
      duration: 5000,
    },
    {
      id: 's7',
      route: '/analitika',
      title: '📊 Аналитика',
      what: 'Аналитика закупочной деятельности отдела за 2026 год.',
      why: 'Все графики строятся из актуального реестра. Динамика по месяцам, распределение по статусам, экономия бюджета — всё в реальном времени.',
      duration: 5000,
    },
    {
      id: 's8',
      route: '/rukovoditel',
      title: '👔 Панель руководителя',
      what: 'Специальный вид для руководства — нагрузка специалистов и проблемные закупки.',
      why: 'Руководитель видит общую картину без лишних деталей: кто чем занят, что требует внимания, как распределён бюджет по подразделениям.',
      duration: 5000,
    },
    {
      id: 's9',
      route: '/about',
      title: '✅ Итог: эффект внедрения ЕПП',
      what: 'Страница с экономическим эффектом от внедрения системы.',
      why: '~3 часа экономии в день, сокращение ошибок на 80%, поиск документов в 180 раз быстрее. ЕПП — реальный инструмент для МТО Росреестра.',
      duration: 6000,
    },
  ];
}

/* ─── Компонент ──────────────────────────── */
export function DemoScenario({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { advanceWorkflow, changeStatus, reset } = useAppStore();

  const steps = buildSteps(advanceWorkflow, changeStatus);

  const [step, setStep]       = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [done, setDone]       = useState(false);
  const timerRef              = useRef<NodeJS.Timeout | null>(null);

  const cur = steps[step];
  const isLast = step === steps.length - 1;
  const pct = Math.round(((step + 1) / steps.length) * 100);

  // Переход на следующий шаг
  const goNext = useCallback(async () => {
    if (busy) return;

    if (isLast) {
      setDone(true);
      setPlaying(false);
      return;
    }

    setBusy(true);

    // Выполняем действие текущего шага (смена статуса и т.д.)
    if (cur.action) {
      cur.action();
      await new Promise(r => setTimeout(r, 400));
    }

    const next = steps[step + 1];

    // Переходим на страницу следующего шага
    if (next.route !== pathname) {
      router.push(next.route);
      await new Promise(r => setTimeout(r, 600));
    }

    setStep(s => s + 1);
    setBusy(false);
  }, [busy, isLast, cur, step, steps, pathname, router]);

  // Авто-таймер
  useEffect(() => {
    if (!playing || busy || done) return;

    timerRef.current = setTimeout(() => {
      goNext();
    }, cur.duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, busy, done, step, cur.duration, goNext]);

  // При первом открытии — идём на первую страницу
  useEffect(() => {
    if (steps[0].route !== pathname) {
      router.push(steps[0].route);
    }
  }, []);

  const handlePlayPause = () => {
    if (done) return;
    setPlaying(p => !p);
  };

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999]">
      {/* Прогресс-полоска */}
      <div className="h-1 bg-gray-200">
        {playing && !done && (
          <div
            className="h-1 bg-blue-500 transition-all"
            style={{
              width: `${pct}%`,
              transition: `width ${cur.duration}ms linear`,
            }}
          />
        )}
        {!playing && (
          <div className="h-1 bg-blue-600" style={{ width: `${pct}%` }} />
        )}
      </div>

      <div className="bg-white border-t border-gray-200 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 py-3">

          {done ? (
            /* ── Финальный экран ── */
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">Демонстрация завершена!</div>
                  <div className="text-xs text-gray-500">
                    Система ЕПП показала полный цикл закупки от реестра до архива
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { reset(); setStep(0); setDone(false); setPlaying(false); router.push('/dashboard'); }}
                  className="gov-btn gov-btn-ghost gov-btn-sm"
                >
                  🔄 Начать сначала
                </button>
                <button onClick={handleClose}
                  className="gov-btn gov-btn-primary gov-btn-sm">
                  <CheckCircle size={13} /> Завершить
                </button>
              </div>
            </div>
          ) : (
            /* ── Основная панель ── */
            <div className="flex items-start gap-4">

              {/* Левая часть: шаг и описание */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">
                    {step + 1} / {steps.length}
                  </span>
                  <div className="h-3 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {busy && (
                    <span className="text-xs text-blue-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                      переход...
                    </span>
                  )}
                </div>

                <div className="text-sm font-bold text-gray-900 mb-0.5">{cur.title}</div>
                <div className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-700">Что: </span>{cur.what}
                </div>
                <div className="text-xs text-blue-700 leading-relaxed mt-0.5">
                  <span className="font-bold">Зачем: </span>{cur.why}
                </div>
              </div>

              {/* Правая часть: кнопки */}
              <div className="flex items-center gap-2 flex-shrink-0">

                {/* Авто/Пауза */}
                <button
                  onClick={handlePlayPause}
                  disabled={busy}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    playing
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title={playing ? 'Пауза' : 'Автопоказ'}
                >
                  {playing
                    ? <><Pause size={13} /> Пауза</>
                    : <><Play size={13} /> Авто</>
                  }
                </button>

                {/* Далее — главная кнопка */}
                <button
                  onClick={goNext}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-blue-200"
                >
                  {busy
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : isLast
                      ? <><CheckCircle size={14} /> Готово</>
                      : <>Далее <ChevronRight size={14} /></>
                  }
                </button>

                {/* Закрыть */}
                <button onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Закрыть сценарий">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Подсказка */}
        {!done && (
          <div className="border-t border-gray-100 py-1.5 text-center">
            <span className="text-xs text-gray-300">
              «Далее» — следующий шаг &nbsp;·&nbsp; «Авто» — автопоказ &nbsp;·&nbsp; X — закрыть
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Кнопка запуска ─────────────────────── */
export function DemoScenarioButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
        title="Запустить демонстрационный сценарий"
      >
        <Play size={11} /> Демо-сценарий
      </button>
      {open && <DemoScenario onClose={() => setOpen(false)} />}
    </>
  );
}
