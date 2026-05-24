'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, X, ChevronRight, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store/index';
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
    why: 'Специалист видит статус каждой закупки, поставщика и срок. Фильтры сохраняются в ссылке.',
    duration: 5000,
  },
  {
    route: '/zakupki/p001',
    title: '📄 Карточка закупки',
    what: 'Карточка закупки «Поставка картриджей» — 10 вкладок с полной информацией.',
    why: 'Документы, финансы, поставщик, согласования, история — всё в одном месте.',
    duration: 6000,
  },
  {
    route: '/zakupki/p001',
    title: '💰 Переход к оплате',
    what: 'Система переводит закупку на этап «Оплата». Поставка получена.',
    why: 'Каждый переход фиксируется с датой и именем. Бухгалтерия получает уведомление автоматически.',
    newStatus: 'payment',
    duration: 5000,
  },
  {
    route: '/zakupki/p001',
    title: '🗄️ Архивирование',
    what: 'Закупка завершена и переходит в архив.',
    why: 'Архив хранит документы 5 лет по требованиям 44-ФЗ.',
    newStatus: 'archive',
    duration: 5000,
  },
  {
    route: '/kontrol-srokov',
    title: '⏰ Контроль сроков',
    what: 'Светофор дедлайнов: красные — просрочено, оранжевые — критично.',
    why: 'Система создаёт уведомления за 5 дней до срока автоматически.',
    duration: 5000,
  },
  {
    route: '/analitika',
    title: '📊 Аналитика',
    what: 'Динамика закупок, распределение по статусам, топ поставщиков.',
    why: 'Все графики строятся из актуального реестра в реальном времени.',
    duration: 5000,
  },
  {
    route: '/rukovoditel',
    title: '👔 Панель руководителя',
    what: 'Специальный вид для руководства — нагрузка специалистов.',
    why: 'Руководитель видит кто чем занят, что требует внимания.',
    duration: 5000,
  },
  {
    route: '/about',
    title: '✅ Экономический эффект',
    what: 'Итоги внедрения ЕПП с конкретными цифрами.',
    why: '~3 часа экономии в день, ошибок меньше на 80%, поиск в 180 раз быстрее.',
    duration: 6000,
  },
];

const SESSION_KEY = 'epp_demo_step';
const SESSION_PLAYING = 'epp_demo_playing';

/* ─── Компонент ──────────────────────────── */
export function DemoScenario({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { changeStatus } = useAppStore();

  // Восстанавливаем шаг из sessionStorage после перезагрузки
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return Number(sessionStorage.getItem(SESSION_KEY) ?? 0);
  });
  const [playing, setPlaying] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_PLAYING) === 'true';
  });
  const [done, setDone]   = useState(false);
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cur    = STEPS[step] ?? STEPS[0];
  const isLast = step === STEPS.length - 1;
  const pct    = Math.round(((step + 1) / STEPS.length) * 100);

  // Сохраняем шаг в sessionStorage при каждом изменении
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, String(step));
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_PLAYING, String(playing));
  }, [playing]);

  const goNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (step >= STEPS.length - 1) {
      setDone(true);
      setPlaying(false);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_PLAYING);
      return;
    }

    // Выполняем действие текущего шага
    if (cur.newStatus) {
      changeStatus('p001', cur.newStatus, 'u1', 'Петров А.В.');
    }

    const nextStep = step + 1;
    const next = STEPS[nextStep];
    setStep(nextStep);

    router.push(next.route);

  }, [step, cur, changeStatus]);

  // Авто-таймер
  useEffect(() => {
    if (!playing || done) return;
    timerRef.current = setTimeout(goNext, cur.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, done, step, goNext, cur.duration]);

  const handleClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_PLAYING);
    onClose();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999]">
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
                  <div className="text-sm font-bold">Демонстрация завершена!</div>
                  <div className="text-xs text-gray-500">Полный цикл закупки показан</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setStep(0); setDone(false); setPlaying(false); }}
                  className="gov-btn gov-btn-ghost gov-btn-sm">🔄 Сначала</button>
                <button onClick={handleClose} className="gov-btn gov-btn-primary gov-btn-sm">
                  <CheckCircle size={13} /> Завершить
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
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
                  <span className="font-semibold">Что: </span>{cur.what}
                </div>
                <div className="text-xs text-blue-700 leading-relaxed mt-0.5">
                  <span className="font-semibold">Зачем: </span>{cur.why}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                <button onClick={() => setPlaying(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                    playing ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                  {playing ? <><Pause size={13}/> Пауза</> : <><Play size={13}/> Авто</>}
                </button>

                <button onClick={goNext}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors">
                  {isLast ? <><CheckCircle size={14}/> Готово</> : <>Далее <ChevronRight size={14}/></>}
                </button>

                <button onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <X size={14}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DemoScenarioButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-green-600 text-white hover:bg-green-700 transition-colors">
        <Play size={11}/> Демо-сценарий
      </button>
      {open && <DemoScenario onClose={() => setOpen(false)}/>}
    </>
  );
}
