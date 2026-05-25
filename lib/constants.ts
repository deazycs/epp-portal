/**
 * ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ для статусов, порядка workflow и меток.
 * Импортируйте отсюда — не дублируйте в store/index.ts и страницах.
 */

import type { ProcurementStatus } from '@/types';

// Порядок этапов workflow (14 шагов)
export const WORKFLOW_STATUS_ORDER: ProcurementStatus[] = [
  'draft',
  'sz_approval',
  'financing',
  'preparation',
  'plan_schedule',
  'eis_notice',
  'placement',
  'bidding',
  'winner_approval',
  'contract_expertise',
  'deputy_signing',
  'contract_signed',
  'execution',
  'payment',
  'payment_docs',
  'payment_done',
  'eis_reporting',
  'archive',
];

// Русские метки статусов
export const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  draft:              'СЗ в МТО',
  sz_approval:        'Согласование СЗ',
  financing:          'Финансирование',
  preparation:        'Подготовка к закупке',
  plan_schedule:      'Включение в план-график ЕИС',
  eis_notice:         'Извещение в ЕИС',
  placement:          'Размещение / Аукцион на Сбер-АСТ',
  bidding:            'Торги',
  winner_approval:    'Согласование победителя',
  contract_expertise: 'Экспертиза договора',
  deputy_signing:     'Визирование Зам. рук.',
  contract_signed:    'Договор подписан (ЭЦП)',
  execution:          'Исполнение',
  payment:            'Оплата',
  payment_docs:       'Документы переданы в ФЭО',
  payment_done:       'Оплачено',
  eis_reporting:      'Отчётность в ЕИС',
  archive:            'Архив',
  cancelled:          'Отменено',
};

// CSS-классы для бейджей статусов
export const WORKFLOW_STATUS_COLORS: Record<string, string> = {
  draft:              'bg-gray-100 text-gray-700 border-gray-300',
  sz_approval:        'bg-yellow-50 text-yellow-800 border-yellow-300',
  financing:          'bg-orange-50 text-orange-800 border-orange-300',
  preparation:        'bg-blue-50 text-blue-800 border-blue-300',
  plan_schedule:      'bg-slate-50 text-slate-700 border-slate-300',
  eis_notice:         'bg-violet-50 text-violet-800 border-violet-300',
  placement:          'bg-indigo-50 text-indigo-800 border-indigo-300',
  bidding:            'bg-purple-50 text-purple-800 border-purple-300',
  winner_approval:    'bg-pink-50 text-pink-800 border-pink-300',
  contract_expertise: 'bg-cyan-50 text-cyan-800 border-cyan-300',
  deputy_signing:     'bg-teal-50 text-teal-800 border-teal-300',
  contract_signed:    'bg-green-50 text-green-800 border-green-300',
  execution:          'bg-emerald-50 text-emerald-800 border-emerald-300',
  payment:            'bg-lime-50 text-lime-800 border-lime-300',
  payment_docs:       'bg-amber-50 text-amber-800 border-amber-300',
  payment_done:       'bg-green-50 text-green-800 border-green-300',
  eis_reporting:      'bg-sky-50 text-sky-800 border-sky-300',
  archive:            'bg-gray-100 text-gray-600 border-gray-300',
  cancelled:          'bg-red-50 text-red-700 border-red-300',
};

// Тип приоритета
export const PRIORITY_LABELS: Record<string, string> = {
  low:    'Низкий',
  normal: 'Обычный',
  high:   'Высокий',
  urgent: 'Срочный',
};

// Тип риска
export const RISK_LEVEL_LABELS: Record<string, string> = {
  low:      'Низкий',
  medium:   'Средний',
  high:     'Высокий',
  critical: 'Критический',
};

// Тип закупки
export const PROCUREMENT_TYPE_LABELS: Record<string, string> = {
  goods:    'Товары',
  works:    'Работы',
  services: 'Услуги',
};

// Процедуры закупок
export const PROCEDURE_LABELS: Record<string, string> = {
  eat_kotировки: 'ЕАТ «Берёзка» — котировочная сессия',
  eis_auction:   'ЕИС + Сбер-АСТ — электронный аукцион',
  eis_konkurs:   'ЕИС — открытый конкурс',
  single:        'Единственный поставщик (ст. 93)',
};
