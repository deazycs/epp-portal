'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, SkipForward, X, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store/index';
import { WORKFLOW_STATUS_ORDER, WORKFLOW_STATUS_LABELS } from '@/lib/constants';
import { STATUS_LABELS } from '@/mock/data/procurements';
import type { ProcurementStatus } from '@/types';

const STATUS_ORDER = WORKFLOW_STATUS_ORDER;

const STEP_COMMENTARY: Record<string, string> = {
  draft:              'ИТ-отдел подал служебную записку на закупку картриджей. МТО принял и зарегистрировал.',
  sz_approval:        'СЗ передана на согласование Заместителю руководителя Фёдорову С.В. Ожидаем резолюцию.',
  financing:          'Фёдоров С.В. одобрил. ФЭО перекладывает лимиты на статью расходов КОСГУ 344.',
  preparation:        'Запрошены 3 КП от поставщиков. Подготовлены ТЗ, обоснование НМЦК и проект договора.',
  placement:          'Деньги переложены, документы готовы. Открываем котировочную сессию в ЕАТ «Берёзка».',
  bidding:            'Сессия завершена. ООО «ТехноОфис» предложил минимальную цену 156 400 руб. Экономия 5 600 руб.',
  winner_approval:    'Победитель согласован Начальником МТО Смирновой Н.С. Проверка в реестре НДП пройдена.',
  contract_expertise: 'Договор передан в ФЭО и правовой отдел. Получены обе визы. Квиток собран.',
  deputy_signing:     'Договор с квитком передан Зам. руководителю Фёдорову С.В. Завизирован.',
  contract_signed:    'Договор подписан ЭЦП. Распечатан и передан поставщику. Запись в реестре ЕАТ.',
  execution:          'Поставщик привёз картриджи. Приёмочная комиссия проверила и подписала накладные.',
  payment:            'Документы на оплату переданы в бухгалтерию. Волкова Е.И. оформила платёжное поручение.',
  eis_reporting:      'Отчёт об исполнении договора размещён в ЕАТ «Берёзка». Закупка закрыта.',
  archive:            '✅ Закупка завершена и переведена в архив. Документы переданы на хранение (срок 5 лет).',
};

interface DemoScenarioProps {
  onClose: () => void;
}

export function DemoScenario({ onClose }: DemoScenarioProps) {
  const router = useRouter();
  const { procurements, changeStatus } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [speed, setSpeed] = useState(2500); // мс между шагами

  // Берём первую активную закупку через Берёзку
  const targetProc = procurements.find(p => 
    (p as any).procedure === 'eat_kotировки' && p.id === 'p001'
  ) ?? procurements[0];

  const currentStatus = STATUS_ORDER[currentStep];
  const commentary = STEP_COMMENTARY[currentStatus] ?? '';
  const progress = Math.round(((currentStep + 1) / STATUS_ORDER.length) * 100);

  const advance = useCallback(() => {
    if (currentStep >= STATUS_ORDER.length - 1) {
      setRunning(false);
      setDone(true);
      return;
    }
    const nextStatus = STATUS_ORDER[currentStep];
    changeStatus(targetProc.id, nextStatus, 'u1', 'Петров А.В.');
    // Переходим на страницу закупки
    router.push(`/zakupki/${targetProc.id}`);
    setCurrentStep(s => s + 1);
  }, [currentStep, targetProc.id, changeStatus, router]);

  // Автозапуск
  useEffect(() => {
    if (!running || done) return;
    const timer = setTimeout(advance, speed);
    return () => clearTimeout(timer);
  }, [running, done, advance, speed]);

  return (
    <div className="fixed inset-0 z-[9990] flex items-end justify-center pb-4 px-3"
      style={{ background:'rgba(0,0,20,0.6)' }}>
      
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        
        {/* Прогресс */}
        <div className="h-1.5 bg-gray-100">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-700"
            style={{ width:`${progress}%` }}/>
        </div>

        {/* Шапка */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <Play size={9} className="text-white ml-px"/>
            </span>
            <span className="text-xs font-bold text-gray-600">
              Демо-сценарий · Этап {currentStep + 1} из {STATUS_ORDER.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select value={speed} onChange={e=>setSpeed(Number(e.target.value))}
              className="text-xs border border-gray-200 rounded px-2 py-1">
              <option value={4000}>Медленно</option>
              <option value={2500}>Нормально</option>
              <option value={1500}>Быстро</option>
            </select>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={14}/>
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="p-5">
          {done ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Сценарий завершён!</h3>
              <p className="text-sm text-gray-600 mb-4">
                Закупка прошла все 14 этапов от служебной записки до архива за{' '}
                <strong>{Math.round(STATUS_ORDER.length * speed / 1000)} сек.</strong> демонстрации.
              </p>
              <button onClick={onClose}
                className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700">
                ✓ Закрыть
              </button>
            </div>
          ) : (
            <>
              {/* Текущий этап */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                    {currentStep + 1}
                  </span>
                  <h3 className="text-base font-bold text-gray-900">
                    {WORKFLOW_STATUS_LABELS[currentStatus]}
                  </h3>
                  {running && (
                    <span className="flex items-center gap-1 text-xs text-blue-500 animate-pulse ml-auto">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"/>
                      Идёт...
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed pl-10">{commentary}</p>
              </div>

              {/* Закупка */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-blue-600">{targetProc.registryNumber}</div>
                    <div className="text-xs text-gray-700 mt-0.5">{targetProc.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-800">
                      {(targetProc.contractSum ?? targetProc.plannedSum).toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-gray-400">{targetProc.responsibleName}</div>
                  </div>
                </div>
              </div>

              {/* Мини-прогресс по шагам */}
              <div className="flex gap-1 mb-4 flex-wrap">
                {STATUS_ORDER.map((s,i) => (
                  <div key={s} title={STATUS_LABELS[s]}
                    className={`h-1.5 flex-1 min-w-4 rounded-full transition-all duration-300 ${
                      i < currentStep ? 'bg-green-400' :
                      i === currentStep ? 'bg-blue-600 animate-pulse' :
                      'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Кнопки */}
              <div className="flex items-center gap-3">
                <button onClick={() => setRunning(r => !r)}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
                    running
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                  {running ? <><Pause size={14}/> Пауза</> : <><Play size={14}/> {currentStep === 0 ? 'Запустить' : 'Продолжить'}</>}
                </button>

                <button onClick={advance} disabled={running}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight size={14}/> Шаг вперёд
                </button>

                <button onClick={onClose}
                  className="ml-auto text-xs text-gray-400 hover:text-gray-600">
                  Пропустить
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Кнопка запуска сценария ─── */
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
