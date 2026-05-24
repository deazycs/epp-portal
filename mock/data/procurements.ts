import { WORKFLOW_STATUS_LABELS as STATUS_LABELS, WORKFLOW_STATUS_COLORS as STATUS_COLORS, WORKFLOW_STATUS_ORDER as STATUS_ORDER } from '@/lib/constants';
export { STATUS_LABELS, STATUS_COLORS, STATUS_ORDER };

import type { Procurement, WorkflowStep } from '@/types';
import type { ProcurementStatus } from '@/types';

// Реальный workflow Росреестра МТО
// Типы закупочных процедур
export type ProcurementProcedure = 'eat_kotировки' | 'eis_auction' | 'eis_konkurs' | 'single';

export const PROCEDURE_LABELS: Record<string, string> = {
  eat_kotировки: 'ЕАТ «Берёзка» — запрос котировок',
  eis_auction:   'ЕИС + Сбер-АСТ — электронный аукцион',
  eis_konkurs:   'ЕИС — открытый конкурс',
  single:        'Единственный поставщик (ст. 93)',
};

export const PROCEDURE_DESCRIPTIONS: Record<string, string> = {
  eat_kotировки: 'Закупка у единственного поставщика через ЕАТ «Берёзка» (п.4 ч.1 ст.93 44-ФЗ). До 600 тыс. руб. Котировочная сессия 2–24 ч, последние 10 мин — вслепую. Реестр контрактов в ЕАТ без публикации в ЕИС.',
  eis_auction:   'Электронный аукцион по 44-ФЗ (ст.59-71). Сначала — включение в план-график и извещение в ЕИС (7 или 15 дней). Затем — аукцион на Сбер-АСТ в реальном времени. 10-дневный мораторий перед подписанием контракта. Реестр контрактов в ЕИС обязателен.',
  eis_konkurs:   'Открытый конкурс в электронной форме по 44-ФЗ. Победитель определяется по совокупности критериев: цена и квалификация. Публикация в ЕИС.',
  single:        'Закупка у единственного поставщика по ст. 93 44-ФЗ (не через ЕАТ «Берёзка»). Обоснование выбора основания, обоснование цены.',
};

// Этапы торгов в зависимости от процедуры
export const BIDDING_STEPS: Record<string, Array<{status: string; name: string; description: string; order: number; responsible: string; requiredDocuments: string[]}>> = {

  // ─── ЕАТ «Берёзка» — закупка у единственного поставщика п.4 ч.1 ст.93 44-ФЗ ───
  eat_kotировки: [
    {
      status: 'placement',
      name: 'Котировочная сессия на ЕАТ «Берёзка»',
      description: 'Размещение котировочной сессии на портале agregatoreat.ru. Поставщики подают ценовые предложения в течение 2–24 часов. Последние 10 минут — торги вслепую: участники не видят ставок друг друга. Победит наименьшая цена.',
      order: 5,
      responsible: 'Специалист МТО (Петров А.В.)',
      requiredDocuments: [
        'Извещение о котировочной сессии (ЕАТ)',
        'Техническое задание (приложение к сессии)',
        'Проект договора (приложение к сессии)',
      ],
    },
    {
      status: 'bidding',
      name: 'Определение победителя котировочной сессии',
      description: 'Автоматическое определение победителя по наименьшей цене по итогам сессии. Проверка поставщика: не в реестре недобросовестных поставщиков (РНП). На подписание договора — 4 рабочих дня. Реестр контрактов ведётся в ЕАТ без публикации в ЕИС.',
      order: 6,
      responsible: 'Площадка ЕАТ «Берёзка» / Петров А.В.',
      requiredDocuments: [
        'Протокол котировочной сессии (ЕАТ)',
        'Сведения о победителе (наименование, ИНН, цена)',
        'Проверка победителя в реестре РНП',
      ],
    },
  ],

  // ─── ЕИС + Сбер-АСТ — электронный аукцион по 44-ФЗ ст.59-71 ───
  eis_auction: [
    {
      status: 'plan_schedule',
      name: 'Включение в план-график ЕИС',
      description: 'Обязательное условие: закупка должна быть включена в план-график на сайте zakupki.gov.ru. Без этого разместить извещение невозможно. Изменения в план-график вносятся не позднее чем за 1 день до публикации извещения.',
      order: 5,
      responsible: 'Специалист МТО (Петров А.В.)',
      requiredDocuments: [
        'Актуальный план-график в ЕИС с включённой закупкой',
        'Идентификационный код закупки (ИКЗ)',
      ],
    },
    {
      status: 'eis_notice',
      name: 'Публикация извещения в ЕИС',
      description: 'Размещение извещения на zakupki.gov.ru. В извещение включается всё: ТЗ, обоснование НМЦК, проект контракта, требования к участникам, размер обеспечения заявки (0,5–5% НМЦК). Отдельная аукционная документация НЕ составляется — всё в извещении. Срок приёма заявок: минимум 7 дней (НМЦК до 300 млн руб.) или 15 дней (свыше).',
      order: 6,
      responsible: 'Специалист МТО (Петров А.В.)',
      requiredDocuments: [
        'Извещение о закупке (ЕИС) — содержит ТЗ, НМЦК, проект контракта',
        'Техническое задание (без указания брендов)',
        'Обоснование НМЦК (минимум 2 метода, только российские цены с 2025 г.)',
        'Проект контракта',
        'Требования к участникам (лицензии, ст.43 44-ФЗ)',
        'Размер обеспечения заявки (0,5–5% НМЦК)',
      ],
    },
    {
      status: 'placement',
      name: 'Электронный аукцион на Сбер-АСТ',
      description: 'После окончания срока подачи заявок — рассмотрение заявок (не более 2 рабочих дней), затем аукцион в реальном времени на sberbank-ast.ru. Участники снижают НМЦК с шагом 0,5–5%. Побеждает наименьшая цена. Протокол аукциона публикуется в ЕИС в течение 1 часа после окончания торгов.',
      order: 7,
      responsible: 'Площадка Сбер-АСТ / Комиссия по закупкам',
      requiredDocuments: [
        'Протокол рассмотрения заявок на участие',
        'Протокол проведения электронного аукциона (Сбер-АСТ)',
        'Итоговый протокол с результатами торгов (ЕИС)',
      ],
    },
    {
      status: 'bidding',
      name: 'Подведение итогов и 10-дневный мораторий',
      description: 'Рассмотрение заявки победителя (не более 2 рабочих дней). Публикация итогового протокола в ЕИС. ВАЖНО: заключить контракт можно не ранее чем через 10 дней после публикации итогового протокола — это обязательный мораторий по 44-ФЗ.',
      order: 8,
      responsible: 'Специалист МТО / Комиссия',
      requiredDocuments: [
        'Итоговый протокол подведения итогов (ЕИС)',
        'Сведения о победителе аукциона',
        'Проверка победителя в реестре РНП',
      ],
    },
  ],

  // ─── Единственный поставщик ст.93 44-ФЗ ───
  single: [
    {
      status: 'placement',
      name: 'Обоснование закупки у единственного поставщика',
      description: 'Подготовка обоснования по соответствующему пункту ст. 93 44-ФЗ. Согласование с контрактной службой. Расчёт и обоснование цены договора.',
      order: 5,
      responsible: 'Специалист МТО (Петров А.В.) / Козлов Д.М.',
      requiredDocuments: [
        'Обоснование закупки у единственного поставщика (ссылка на п. ст. 93 44-ФЗ)',
        'Расчёт и обоснование цены договора',
      ],
    },
    {
      status: 'bidding',
      name: 'Уведомление / размещение в ЕИС (если требуется)',
      description: 'Для ряда оснований ст. 93 — направление уведомления в контрольный орган или размещение отчёта об обосновании в ЕИС. Для п.4 ч.1 ст.93 (до 600 тыс.) — не требуется. Реестр контрактов без публикации в ЕИС.',
      order: 6,
      responsible: 'Специалист МТО (Петров А.В.)',
      requiredDocuments: [
        'Уведомление контрольного органа (при необходимости)',
        'Отчёт об обосновании (ЕИС, при необходимости)',
      ],
    },
  ],
};


// Базовый шаблон (общие этапы для всех процедур)
export const WORKFLOW_STEPS_BASE = [
  {
    status: 'draft',
    name: 'Служебная записка в МТО',
    description: 'Получение СЗ от отдела-инициатора с обоснованием потребности. Проверка, регистрация, присвоение номера.',
    order: 1,
    responsible: 'Специалист МТО (Петров А.В.)',
    requiredDocuments: ['Служебная записка от отдела-инициатора'],
  },
  {
    status: 'sz_approval',
    name: 'Согласование СЗ с Зам. руководителя',
    description: 'СЗ передаётся на согласование Заместителю руководителя по МХЧ. При одобрении — возвращается в МТО с резолюцией.',
    order: 2,
    responsible: 'Зам. руководителя (Фёдоров С.В.)',
    requiredDocuments: ['СЗ с резолюцией Зам. руководителя'],
  },
  {
    status: 'financing',
    name: 'Финансирование (перекладывание ЛБО)',
    description: 'Перекладывание лимитов бюджетных обязательств на нужную статью расходов (КБК/КОСГУ). Подтверждение наличия финансирования.',
    order: 3,
    responsible: 'ФЭО / Бухгалтерия (Волкова Е.И.)',
    requiredDocuments: ['Уведомление об изменении ЛБО', 'Сведения о доведённых лимитах'],
  },
  {
    status: 'preparation',
    name: 'Подготовка к закупке',
    description: 'Запрос 3 коммерческих предложений для расчёта НМЦК. Подготовка ТЗ и проекта договора. Выбор способа закупки и площадки.',
    order: 4,
    responsible: 'Специалист МТО (Петров А.В.)',
    requiredDocuments: ['3 коммерческих предложения', 'Техническое задание', 'Обоснование НМЦК', 'Проект договора'],
  },
];

// Постторговые этапы (одинаковые для всех процедур)
export const WORKFLOW_STEPS_POST = [
  {
    status: 'winner_approval',
    name: 'Согласование победителя с нач. МТО',
    description: 'Согласование выбранного победителя торгов с Начальником МТО. Проверка сведений поставщика в реестре НДП.',
    order: 8,
    responsible: 'Начальник МТО (Смирнова Н.С.)',
    requiredDocuments: ['Протокол торгов', 'Сведения о победителе', 'Лист согласования нач. МТО'],
  },
  {
    status: 'contract_expertise',
    name: 'Экспертиза договора (ФЭО + правовой)',
    description: 'Передача проекта договора в ФЭО для финансовой визы, затем в правовой отдел для правовой визы. Сбор всех виз на квитке.',
    order: 9,
    responsible: 'ФЭО + Правовой отдел',
    requiredDocuments: ['Договор с визой ФЭО', 'Договор с визой правового отдела', 'Квиток со всеми визами'],
  },
  {
    status: 'deputy_signing',
    name: 'Визирование Зам. руководителя',
    description: 'Передача договора с квитком (визы ФЭО + правового) Заместителю руководителя для финального визирования.',
    order: 10,
    responsible: 'Зам. руководителя (Фёдоров С.В.)',
    requiredDocuments: ['Договор с квитком (все визы)', 'Сопроводительная записка'],
  },
  {
    status: 'contract_signed',
    name: 'Подписание договора (печать + ЭЦП)',
    description: 'Отправка договора на печать. Подписание ЭЦП. Размещение сведений о заключении договора в ЕИС/ЕАТ для отчётности.',
    order: 11,
    responsible: 'МТО + Руководитель',
    requiredDocuments: ['Подписанный договор (ЭЦП)', 'Реестровая запись в ЕИС/ЕАТ'],
  },
  {
    status: 'execution',
    name: 'Исполнение договора',
    description: 'Ожидаем поставку товара или оказание услуг в установленные договором сроки. Приёмка, подписание первичных документов.',
    order: 12,
    responsible: 'Специалист МТО (Петров А.В.)',
    requiredDocuments: ['Товарная накладная / УПД', 'Акт выполненных работ', 'Акт приёмки-передачи'],
  },
  {
    status: 'payment',
    name: 'Оплата',
    description: 'Получение документов на оплату (счёт, акт, накладная). Передача пакета в бухгалтерию. Оформление платёжного поручения.',
    order: 13,
    responsible: 'Бухгалтерия (Волкова Е.И.)',
    requiredDocuments: ['Счёт / Счёт-фактура', 'Акт / Накладная', 'Платёжное поручение'],
  },
  {
    status: 'eis_reporting',
    name: 'Отчётность в ЕИС/ЕАТ',
    description: 'Размещение сведений об исполнении договора в ЕИС или ЕАТ «Берёзка». Закрытие закупки в системе.',
    order: 14,
    responsible: 'Специалист МТО (Петров А.В.)',
    requiredDocuments: ['Отчёт об исполнении договора (ЕИС)', 'Документы о приёмке (ЕИС)'],
  },
  {
    status: 'archive',
    name: 'Архив',
    description: 'Закупка завершена. Вся документация передана на хранение. Срок хранения — 5 лет.',
    order: 15,
    responsible: 'Специалист МТО',
    requiredDocuments: ['Папка с полным комплектом документов'],
  },
];

// Функция генерации полного workflow по типу процедуры
export function buildWorkflow(procedure: string = 'eat_kotировки') {
  const biddingSteps = BIDDING_STEPS[procedure] ?? BIDDING_STEPS['eat_kotировки'];

  // Постторговые этапы начинаются с order = max(biddingSteps.order) + 1
  const maxOrder = Math.max(...biddingSteps.map(s => s.order));
  const postSteps = WORKFLOW_STEPS_POST.map((s, i) => ({
    ...s,
    order: maxOrder + 1 + i,
  }));

  return [...WORKFLOW_STEPS_BASE, ...biddingSteps, ...postSteps];
}

// Для обратной совместимости — шаблон по умолчанию (Берёзка)
export const WORKFLOW_STEPS_TEMPLATE = buildWorkflow('eat_kotировки');









function makeSteps(procId: string, completedUpTo: number, activeStep: number, procedure = 'eat_kotировки') {
  const template = buildWorkflow(procedure);
  return template.map((s, i) => ({
    id: `ws-${procId}-${i}`,
    procurementId: procId,
    status: s.status as ProcurementStatus,
    name: s.name,
    description: s.description,
    order: s.order,
    responsible: s.responsible,
    requiredDocuments: s.requiredDocuments,
    isCompleted: s.order <= completedUpTo,
    isActive: s.order === activeStep,
    completedAt: s.order <= completedUpTo ? '2026-04-10T10:00:00' : undefined,
    completedByName: s.order <= completedUpTo ? 'Петров А.В.' : undefined,
  }));
}

export const RISK_LABELS: Record<string, string> = {
  low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический',
};

export const RISK_COLORS: Record<string, string> = {
  low:      'bg-green-50 text-green-700 border-green-300',
  medium:   'bg-yellow-50 text-yellow-700 border-yellow-300',
  high:     'bg-orange-50 text-orange-700 border-orange-300',
  critical: 'bg-red-50 text-red-700 border-red-300',
};

export const MOCK_PROCUREMENTS: Procurement[] = [
  {
    id: 'p001',
    registryNumber: 'РЗ-2026-00142',
    eatNumber: 'БЕР-2026-0315847',
    eisNumber: '2026142',
    title: 'Поставка картриджей для принтеров и МФУ (II квартал 2026)',
    description: 'Закупка расходных материалов для оргтехники. СЗ от ИТ-отдела от 01.04.2026.',
    status: 'execution',
    riskLevel: 'low',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u6', initiatorName: 'Никитин П.А.',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    plannedSum: 162000, contractSum: 156400, paidSum: 0,
    budgetCode: '051', kbk: '321 0113 4590100002 244', kosgu: '344',
    financingSource: 'Федеральный бюджет',
    supplierId: 's1', supplierName: 'ООО «ТехноОфис»', supplierInn: '7701234567',
    procurementType: 'goods',
    items: [
      { id:'i1', name:'Картридж HP LaserJet CF217A', unit:'шт.', quantity:28, unitPrice:2300, totalPrice:64400, okpd2Code:'26.20.16' },
      { id:'i2', name:'Картридж Canon 725', unit:'шт.', quantity:20, unitPrice:1980, totalPrice:39600, okpd2Code:'26.20.16' },
      { id:'i3', name:'Тонер Samsung MLT-D111S', unit:'шт.', quantity:14, unitPrice:2380, totalPrice:33320, okpd2Code:'26.20.16' },
      { id:'i4', name:'Картридж Epson C13T66414A', unit:'шт.', quantity:12, unitPrice:1590, totalPrice:19080, okpd2Code:'26.20.16' },
    ],
    createdAt: '2026-04-01T09:00:00', updatedAt: '2026-05-10T14:30:00',
    plannedStartDate: '2026-04-01', plannedEndDate: '2026-06-30',
    contractDate: '2026-04-22', contractEndDate: '2026-06-30',
    eatPlacementDate: '2026-04-07',
    documentIds: ['doc1','doc2','doc3'],
    tags: ['расходные материалы', 'оргтехника', 'ИТ-отдел'],
    priority: 'normal', isOverdue: false,
    szInitiatorDept: 'ИТ-отдел', szDate: '2026-04-01',
    nmck: 162000,
    economySumTotal: 5600, economyPct: 3.5,
    workflowSteps: makeSteps('p001', 11, 11, 'eat_kotировки'),
  },
  {
    id: 'p002',
    registryNumber: 'РЗ-2026-00089',
    eatNumber: 'БЕР-2026-0289410',
    title: 'Поставка серверного оборудования для ЦОД',
    description: 'Закупка серверов для модернизации ЦОД. СЗ от ИТ-отдела от 05.02.2026. Конкурентная процедура по 44-ФЗ.',
    status: 'contract_expertise',
    riskLevel: 'high',
    departmentId: 'd4', departmentName: 'ИТ-отдел',
    initiatorId: 'u6', initiatorName: 'Никитин П.А.',
    responsibleId: 'u3', responsibleName: 'Козлов Д.М.',
    plannedSum: 4850000, contractSum: 4720000, paidSum: 0,
    budgetCode: '051', kbk: '321 0113 4590100002 242', kosgu: '310',
    financingSource: 'Федеральный бюджет',
    supplierId: 's3', supplierName: 'ООО «СитиКомп»', supplierInn: '7743012345',
    procurementType: 'goods',
    items: [
      { id:'i5', name:'Сервер Dell PowerEdge R750', unit:'шт.', quantity:4, unitPrice:780000, totalPrice:3120000, okpd2Code:'26.20.15' },
      { id:'i6', name:'СХД NetApp AFF A250', unit:'шт.', quantity:1, unitPrice:1600000, totalPrice:1600000, okpd2Code:'26.20.22' },
    ],
    createdAt: '2026-02-10T10:00:00', updatedAt: '2026-05-18T16:00:00',
    plannedStartDate: '2026-02-10', plannedEndDate: '2026-07-31',
    eatPlacementDate: '2026-03-01',
    documentIds: ['doc4','doc5'],
    tags: ['ИТ', 'серверы', 'ЦОД', 'конкурс'],
    priority: 'high', isOverdue: false,
    szInitiatorDept: 'ИТ-отдел', szDate: '2026-02-05',
    nmck: 4850000, economySumTotal: 130000, economyPct: 2.7,
    procedure: 'eis_auction',
    workflowSteps: makeSteps('p002', 9, 9, 'eis_auction'),
  },
  {
    id: 'p003',
    registryNumber: 'РЗ-2026-00178',
    title: 'Услуги по комплексной уборке служебных помещений (III кв. 2026)',
    description: 'СЗ от АХО от 14.05.2026. Уборка 1250 кв.м. ежедневно плюс генеральные уборки.',
    status: 'sz_approval',
    riskLevel: 'low',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u7', initiatorName: 'Орлова Т.В.',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    plannedSum: 375000,
    budgetCode: '051', kbk: '321 0113 4590100002 225', kosgu: '226',
    financingSource: 'Федеральный бюджет',
    procurementType: 'services',
    items: [
      { id:'i7', name:'Услуги ежедневной уборки (1250 кв.м)', unit:'мес.', quantity:3, unitPrice:62000, totalPrice:186000 },
      { id:'i8', name:'Генеральная уборка', unit:'усл.', quantity:3, unitPrice:28000, totalPrice:84000 },
      { id:'i9', name:'Мойка окон (сезонная)', unit:'усл.', quantity:1, unitPrice:105000, totalPrice:105000 },
    ],
    createdAt: '2026-05-15T11:00:00', updatedAt: '2026-05-18T09:15:00',
    plannedStartDate: '2026-07-01', plannedEndDate: '2026-09-30',
    documentIds: ['doc6'],
    tags: ['услуги', 'уборка', 'АХО'],
    priority: 'normal', isOverdue: false,
    szInitiatorDept: 'АХО', szDate: '2026-05-14',
    nmck: 375000,
    workflowSteps: makeSteps('p003', 1, 2, 'eat_kotировки'),
  },
  {
    id: 'p004',
    registryNumber: 'РЗ-2026-00056',
    eatNumber: 'БЕР-2026-0245890',
    title: 'Поставка бумаги офисной А4 (I полугодие 2026)',
    description: 'СЗ от Отдела делопроизводства от 05.01.2026.',
    status: 'payment',
    riskLevel: 'low',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u1', initiatorName: 'Петров А.В.',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    plannedSum: 94500, contractSum: 91800, paidSum: 0,
    budgetCode: '051', kbk: '321 0113 4590100002 244', kosgu: '340',
    financingSource: 'Федеральный бюджет',
    supplierId: 's2', supplierName: 'ЗАО «КанцЛайф»', supplierInn: '5010034782',
    procurementType: 'goods',
    items: [
      { id:'i10', name:'Бумага офисная А4 Navigator Universal 80г/кв.м', unit:'пач.', quantity:310, unitPrice:275, totalPrice:85250 },
      { id:'i11', name:'Бумага офисная А3 Navigator Universal 80г/кв.м', unit:'пач.', quantity:28, unitPrice:590, totalPrice:16520 },
    ],
    createdAt: '2026-01-10T08:30:00', updatedAt: '2026-04-20T12:00:00',
    plannedStartDate: '2026-01-15', plannedEndDate: '2026-05-31',
    contractDate: '2026-01-28', contractEndDate: '2026-05-31',
    actualEndDate: '2026-04-15',
    eatPlacementDate: '2026-01-18',
    documentIds: ['doc7','doc8'],
    tags: ['канцтовары', 'бумага'],
    priority: 'normal', isOverdue: true, overduedays: 4,
    szInitiatorDept: 'Отдел делопроизводства', szDate: '2026-01-05',
    nmck: 94500, economySumTotal: 2700, economyPct: 2.9,
    workflowSteps: makeSteps('p004', 12, 12, 'eat_kotировки'),
  },
  {
    id: 'p005',
    registryNumber: 'РЗ-2026-00203',
    title: 'Разработка и внедрение СМЭВ-адаптера для интеграции с ГИС ЕГРН',
    description: 'СЗ от Отдела ИТ от 18.04.2026. Закупка по 44-ФЗ, электронный аукцион на ЕИС.',
    status: 'preparation',
    riskLevel: 'high',
    departmentId: 'd4', departmentName: 'ИТ-отдел',
    initiatorId: 'u6', initiatorName: 'Никитин П.А.',
    responsibleId: 'u6', responsibleName: 'Никитин П.А.',
    plannedSum: 1850000,
    budgetCode: '051', kbk: '321 0113 4590100002 226', kosgu: '226',
    financingSource: 'Федеральный бюджет',
    procurementType: 'services',
    items: [
      { id:'i12', name:'Разработка СМЭВ-адаптера', unit:'усл.', quantity:1, unitPrice:1400000, totalPrice:1400000 },
      { id:'i13', name:'Поддержка и сопровождение (12 мес.)', unit:'мес.', quantity:12, unitPrice:37500, totalPrice:450000 },
    ],
    createdAt: '2026-04-20T14:00:00', updatedAt: '2026-05-16T10:30:00',
    plannedStartDate: '2026-07-01', plannedEndDate: '2027-06-30',
    documentIds: [],
    tags: ['ИТ', 'разработка ПО', 'СМЭВ', 'ЕГРН'],
    priority: 'high', isOverdue: false,
    szInitiatorDept: 'ИТ-отдел', szDate: '2026-04-18',
    nmck: 1850000,
    procedure: 'eis_auction',
    workflowSteps: makeSteps('p005', 4, 5, 'eis_auction'),
  },
  {
    id: 'p006',
    registryNumber: 'РЗ-2025-00342',
    eatNumber: 'БЕР-2025-0498201',
    title: 'Канцелярские товары (IV квартал 2025)',
    description: 'СЗ от Отдела делопроизводства. Выполнена.',
    status: 'archive',
    riskLevel: 'low',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u7', initiatorName: 'Орлова Т.В.',
    responsibleId: 'u7', responsibleName: 'Орлова Т.В.',
    plannedSum: 57000, contractSum: 54600, paidSum: 54600,
    budgetCode: '051', kbk: '321 0113 4590100002 244', kosgu: '340',
    financingSource: 'Федеральный бюджет',
    supplierId: 's2', supplierName: 'ЗАО «КанцЛайф»', supplierInn: '5010034782',
    procurementType: 'goods',
    items: [
      { id:'i14', name:'Папка-регистратор А4 75мм', unit:'шт.', quantity:140, unitPrice:295, totalPrice:41300 },
      { id:'i15', name:'Стикеры Post-it 76x76мм', unit:'уп.', quantity:90, unitPrice:138, totalPrice:12420 },
    ],
    createdAt: '2025-10-05T09:00:00', updatedAt: '2025-12-28T16:00:00',
    plannedStartDate: '2025-10-10', plannedEndDate: '2025-12-31',
    contractDate: '2025-10-22', contractEndDate: '2025-12-31',
    actualEndDate: '2025-12-20',
    eatPlacementDate: '2025-10-12',
    documentIds: ['doc9'],
    tags: ['канцтовары', 'архив 2025'],
    priority: 'normal', isOverdue: false,
    szInitiatorDept: 'Отдел делопроизводства', szDate: '2025-10-01',
    nmck: 57000, economySumTotal: 2400, economyPct: 4.2,
    workflowSteps: makeSteps('p006', 14, 0, 'eat_kotировки'),
  },
  {
    id: 'p007',
    registryNumber: 'РЗ-2026-00219',
    title: 'Страхование служебного транспорта (КАСКО + ОСАГО)',
    description: 'СЗ от АХО от 18.05.2026. Запрос котировок.',
    status: 'draft',
    riskLevel: 'low',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u7', initiatorName: 'Орлова Т.В.',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    plannedSum: 112000,
    budgetCode: '051', kbk: '321 0113 4590100002 226', kosgu: '226',
    financingSource: 'Федеральный бюджет',
    procurementType: 'services',
    items: [],
    createdAt: '2026-05-19T11:00:00', updatedAt: '2026-05-19T11:00:00',
    plannedStartDate: '2026-07-01', plannedEndDate: '2027-06-30',
    documentIds: [],
    tags: ['страхование', 'транспорт', 'АХО'],
    priority: 'normal', isOverdue: false,
    szInitiatorDept: 'АХО', szDate: '2026-05-18',
    nmck: 112000,
    workflowSteps: makeSteps('p007', 0, 1, 'eat_kotировки'),
  },
  {
    id: 'p008',
    registryNumber: 'РЗ-2026-00134',
    eatNumber: 'БЕР-2026-0312045',
    title: 'Поставка офисной мебели (столы, кресла, шкафы)',
    description: 'СЗ от АХО от 01.04.2026. Запрос котировок в ЕАТ «Берёзка».',
    status: 'bidding',
    riskLevel: 'medium',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u7', initiatorName: 'Орлова Т.В.',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    plannedSum: 445000,
    budgetCode: '051', kbk: '321 0113 4590100002 310', kosgu: '310',
    financingSource: 'Федеральный бюджет',
    procurementType: 'goods',
    items: [
      { id:'i16', name:'Стол письменный 160×80×75 см', unit:'шт.', quantity:15, unitPrice:16200, totalPrice:243000 },
      { id:'i17', name:'Кресло офисное Бюрократ CH-808AXSN', unit:'шт.', quantity:15, unitPrice:13600, totalPrice:204000 },
    ],
    createdAt: '2026-04-05T10:00:00', updatedAt: '2026-05-14T15:30:00',
    plannedStartDate: '2026-04-10', plannedEndDate: '2026-07-31',
    eatPlacementDate: '2026-04-25',
    documentIds: ['doc10'],
    tags: ['мебель', 'АХО', 'ЕАТ Берёзка'],
    priority: 'normal', isOverdue: false,
    szInitiatorDept: 'АХО', szDate: '2026-04-01',
    nmck: 445000,
    workflowSteps: makeSteps('p008', 6, 6, 'eat_kotировки'),
  },
  {
    id: 'p009',
    registryNumber: 'РЗ-2026-00098',
    eatNumber: 'БЕР-2026-0298450',
    title: 'Лицензии Microsoft 365 Business Premium (50 рабочих мест)',
    description: 'СЗ от ИТ-отдела от 18.01.2026. Единственный поставщик (п.5 ч.1 ст.93 44-ФЗ).',
    status: 'eis_reporting',
    riskLevel: 'low',
    departmentId: 'd4', departmentName: 'ИТ-отдел',
    initiatorId: 'u6', initiatorName: 'Никитин П.А.',
    responsibleId: 'u6', responsibleName: 'Никитин П.А.',
    plannedSum: 385000, contractSum: 378000, paidSum: 378000,
    budgetCode: '051', kbk: '321 0113 4590100002 242', kosgu: '226',
    financingSource: 'Федеральный бюджет',
    supplierId: 's5', supplierName: 'ООО «МоскваСофт»', supplierInn: '7725678901',
    procurementType: 'services',
    items: [
      { id:'i18', name:'Microsoft 365 Business Premium, годовая подписка', unit:'лиц.', quantity:50, unitPrice:7560, totalPrice:378000 },
    ],
    createdAt: '2026-01-20T09:00:00', updatedAt: '2026-05-05T12:00:00',
    plannedStartDate: '2026-02-01', plannedEndDate: '2026-05-15',
    contractDate: '2026-02-10', contractEndDate: '2026-05-10',
    actualEndDate: '2026-04-28',
    eatPlacementDate: '2026-01-25',
    documentIds: ['doc11','doc12'],
    tags: ['ПО', 'лицензии', 'Microsoft', 'единственный поставщик'],
    priority: 'high', isOverdue: false,
    szInitiatorDept: 'ИТ-отдел', szDate: '2026-01-18',
    nmck: 385000, economySumTotal: 7000, economyPct: 1.8,
    procedure: 'single',
    workflowSteps: makeSteps('p009', 13, 13, 'single'),
  },
  {
    id: 'p010',
    registryNumber: 'РЗ-2026-00167',
    title: 'Техническое обслуживание лифтов (2026)',
    description: 'СЗ от АХО от 26.04.2026. Плановое ТО. Запрос котировок ЕАТ «Берёзка».',
    status: 'placement',
    riskLevel: 'medium',
    departmentId: 'd1', departmentName: 'Отдел МТО',
    initiatorId: 'u7', initiatorName: 'Орлова Т.В.',
    responsibleId: 'u1', responsibleName: 'Петров А.В.',
    plannedSum: 198000,
    budgetCode: '051', kbk: '321 0113 4590100002 225', kosgu: '225',
    financingSource: 'Федеральный бюджет',
    procurementType: 'services',
    items: [
      { id:'i19', name:'ТО лифтов (2 подъёма), плановое', unit:'мес.', quantity:6, unitPrice:31000, totalPrice:186000 },
      { id:'i20', name:'Аварийный выезд (резерв)', unit:'усл.', quantity:2, unitPrice:6000, totalPrice:12000 },
    ],
    createdAt: '2026-04-28T13:00:00', updatedAt: '2026-05-17T11:00:00',
    plannedStartDate: '2026-07-01', plannedEndDate: '2026-12-31',
    eatPlacementDate: '2026-05-15',
    documentIds: [],
    tags: ['АХО', 'лифты', 'техобслуживание'],
    priority: 'normal', isOverdue: false,
    szInitiatorDept: 'АХО', szDate: '2026-04-26',
    nmck: 198000,
    workflowSteps: makeSteps('p010', 5, 5, 'eat_kotировки'),
  },
];
