import type { Notification, HistoryEntry, Task } from '@/types';

// ─── УВЕДОМЛЕНИЯ ─────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id:'n001', userId:'u1', type:'error', category:'deadline', title:'Просрочка оплаты: РЗ-2026-00056', message:'Срок оплаты по договору с ЗАО «КанцЛайф» истёк 4 дня назад. Необходимо инициировать платёжное поручение.', link:'/zakupki/p004', entityId:'p004-overdue', entityType:'procurement', isRead:false, createdAt:'2026-05-20T09:00:00' },
  { id:'n002', userId:'u1', type:'warning', category:'deadline', title:'Срок исполнения через 3 дня: РЗ-2026-00142', message:'До окончания поставки картриджей по договору с ООО «ТехноОфис» осталось 3 дня (30.05.2026).', link:'/zakupki/p001', entityId:'p001-warn', entityType:'procurement', isRead:false, createdAt:'2026-05-22T08:30:00' },
  { id:'n003', userId:'u1', type:'info', category:'approval', title:'Требуется согласование: СЗ-АХО-2026-091', message:'Орлова Т.В. направила служебную записку на согласование услуг уборки на III квартал 2026 года.', link:'/soglasovaniya', entityId:'sz2', entityType:'note', isRead:false, createdAt:'2026-05-21T14:15:00' },
  { id:'n004', userId:'u1', type:'success', category:'system', title:'Договор подписан: РЗ-2026-00142', message:'Договор с ООО «ТехноОфис» на поставку картриджей подписан ЭЦП и внесён в реестр ЕАТ «Берёзка».', link:'/zakupki/p001', entityId:'p001-signed', entityType:'procurement', isRead:true, createdAt:'2026-04-22T16:40:00', readAt:'2026-04-22T17:00:00' },
  { id:'n005', userId:'u1', type:'warning', category:'deadline', title:'Срок размещения в ЕИС: РЗ-2026-00167', message:'Необходимо разместить извещение о закупке ТО лифтов в ЕИС до 30.05.2026. Осталось 6 дней.', link:'/zakupki/p010', entityId:'p010-eis', entityType:'procurement', isRead:false, createdAt:'2026-05-22T09:00:00' },
  { id:'n006', userId:'u1', type:'info', category:'task', title:'Новая задача: подготовить ТЗ', message:'Козлов Д.М. назначил вам задачу: подготовить техническое задание для закупки серверного оборудования.', link:'/zadachi', entityId:'t003', entityType:'task', isRead:true, createdAt:'2026-05-15T11:00:00', readAt:'2026-05-15T12:30:00' },
  { id:'n007', userId:'u1', type:'info', category:'approval', title:'Согласование завершено: РЗ-2026-00089', message:'Фёдоров С.В. завизировал договор с ООО «СитиКомп». Договор передан на подписание.', link:'/zakupki/p002', entityId:'p002-approved', entityType:'procurement', isRead:true, createdAt:'2026-05-18T15:20:00', readAt:'2026-05-19T09:00:00' },
  { id:'n008', userId:'u1', type:'error', category:'deadline', title:'Просрочка: РЗ-2026-00098 — отчётность ЕИС', message:'Срок размещения отчёта об исполнении договора с ООО «МоскваСофт» в ЕИС истёк. Необходимо срочно разместить.', link:'/zakupki/p009', entityId:'p009-report', entityType:'procurement', isRead:false, createdAt:'2026-05-21T10:00:00' },
  { id:'n009', userId:'u1', type:'success', category:'system', title:'Экономия бюджета: 145 300 руб.', message:'По итогам торгов в мае 2026 года экономия составила 145 300 руб. (1,7% от НМЦК).', link:'/analitika', entityId:'economy-may', entityType:'system', isRead:false, createdAt:'2026-05-20T17:00:00' },
  { id:'n010', userId:'u1', type:'warning', category:'payment', title:'Ожидается оплата: РЗ-2026-00056', message:'Документы на оплату от ЗАО «КанцЛайф» (счёт №КЛ-2026-0089) переданы в бухгалтерию 4 дня назад. Уточните статус платежа.', link:'/platezhi', entityId:'pay-p004', entityType:'procurement', isRead:false, createdAt:'2026-05-20T08:00:00' },
];

// ─── ИСТОРИЯ ДЕЙСТВИЙ ────────────────────────────────────────────
export const MOCK_HISTORY: HistoryEntry[] = [
  { id:'h001', entityId:'p001', entityType:'procurement', userId:'u1', userName:'Петров А.В.', action:'status_change', description:'Статус изменён: «Договор подписан» → «Исполнение»', oldValue:'contract_signed', newValue:'execution', createdAt:'2026-05-10T14:30:00', ipAddress:'10.10.1.45' },
  { id:'h002', entityId:'p002', entityType:'procurement', userId:'u3', userName:'Козлов Д.М.', action:'status_change', description:'Статус изменён: «Согласование победителя» → «Экспертиза договора»', oldValue:'winner_approval', newValue:'contract_expertise', createdAt:'2026-05-18T11:15:00', ipAddress:'10.10.1.47' },
  { id:'h003', entityId:'p003', entityType:'procurement', userId:'u1', userName:'Петров А.В.', action:'CREATE', description:'Создана закупка РЗ-2026-00178: услуги комплексной уборки', createdAt:'2026-05-15T09:00:00', ipAddress:'10.10.1.45' },
  { id:'h004', entityId:'p009', entityType:'procurement', userId:'u6', userName:'Никитин П.А.', action:'status_change', description:'Статус изменён: «Исполнение» → «Отчётность в ЕИС»', oldValue:'execution', newValue:'eis_reporting', createdAt:'2026-05-05T16:00:00', ipAddress:'10.10.1.52' },
  { id:'h005', entityId:'p004', entityType:'procurement', userId:'u1', userName:'Петров А.В.', action:'status_change', description:'Статус изменён: «Исполнение» → «Оплата»', oldValue:'execution', newValue:'payment', createdAt:'2026-04-20T10:30:00', ipAddress:'10.10.1.45' },
  { id:'h006', entityId:'p001', entityType:'procurement', userId:'u2', userName:'Смирнова Н.С.', action:'APPROVE', description:'Победитель согласован: ООО «ТехноОфис» (ИНН 7701234567)', createdAt:'2026-04-18T14:00:00', ipAddress:'10.10.1.46' },
  { id:'h007', entityId:'p005', entityType:'procurement', userId:'u6', userName:'Никитин П.А.', action:'status_change', description:'Статус изменён: «Финансирование» → «Подготовка к закупке»', oldValue:'financing', newValue:'preparation', createdAt:'2026-05-16T10:30:00', ipAddress:'10.10.1.52' },
  { id:'h008', entityId:'p008', entityType:'procurement', userId:'u1', userName:'Петров А.В.', action:'status_change', description:'Статус изменён: «Размещение» → «Торги»', oldValue:'placement', newValue:'bidding', createdAt:'2026-05-14T09:00:00', ipAddress:'10.10.1.45' },
  { id:'h009', entityId:'p002', entityType:'procurement', userId:'u5', userName:'Фёдоров С.В.', action:'APPROVE', description:'СЗ согласована: ИТ-отдел — серверное оборудование для ЦОД', createdAt:'2026-02-12T11:30:00', ipAddress:'10.10.1.50' },
  { id:'h010', entityId:'p010', entityType:'procurement', userId:'u1', userName:'Петров А.В.', action:'status_change', description:'Статус изменён: «Подготовка» → «Размещение в ЕАТ»', oldValue:'preparation', newValue:'placement', createdAt:'2026-05-15T15:00:00', ipAddress:'10.10.1.45' },
];

// ─── ЗАДАЧИ ──────────────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  { id:'t001', title:'Разместить котировочную сессию на ЕАТ «Берёзка» — ТО лифтов', assigneeId:'u1', assigneeName:'Петров А.В.', creatorId:'u2', creatorName:'Смирнова Н.С.', status:'new', priority:'urgent', dueDate:'2026-05-30', procurementId:'p010', createdAt:'2026-05-22T09:00:00', updatedAt:'2026-05-22T09:00:00' },
  { id:'t002', title:'Подготовить обоснование НМЦК для закупки СМЭВ-адаптера (запрос 3 КП)', assigneeId:'u6', assigneeName:'Никитин П.А.', creatorId:'u1', creatorName:'Петров А.В.', status:'in_progress', priority:'high', dueDate:'2026-05-28', procurementId:'p005', createdAt:'2026-05-20T10:00:00', updatedAt:'2026-05-22T14:00:00' },
  { id:'t003', title:'Разместить отчёт об исполнении договора с ООО МоскваСофт в ЕИС', assigneeId:'u6', assigneeName:'Никитин П.А.', creatorId:'u2', creatorName:'Смирнова Н.С.', status:'overdue', priority:'urgent', dueDate:'2026-05-15', procurementId:'p009', createdAt:'2026-05-10T09:00:00', updatedAt:'2026-05-10T09:00:00' },
  { id:'t004', title:'Передать пакет документов в ФЭО для финансовой экспертизы договора по серверам', assigneeId:'u3', assigneeName:'Козлов Д.М.', creatorId:'u1', creatorName:'Петров А.В.', status:'in_progress', priority:'high', dueDate:'2026-05-27', procurementId:'p002', createdAt:'2026-05-18T16:00:00', updatedAt:'2026-05-22T10:00:00' },
  { id:'t005', title:'Получить платёжное поручение по оплате бумаги — ЗАО КанцЛайф', assigneeId:'u4', assigneeName:'Волкова Е.И.', creatorId:'u1', creatorName:'Петров А.В.', status:'overdue', priority:'urgent', dueDate:'2026-05-18', procurementId:'p004', createdAt:'2026-05-15T09:00:00', updatedAt:'2026-05-15T09:00:00' },
  { id:'t006', title:'Согласовать служебную записку АХО на уборку помещений у Фёдорова С.В.', assigneeId:'u1', assigneeName:'Петров А.В.', creatorId:'u7', creatorName:'Орлова Т.В.', status:'new', priority:'normal', dueDate:'2026-05-30', procurementId:'p003', createdAt:'2026-05-21T11:00:00', updatedAt:'2026-05-21T11:00:00' },
  { id:'t007', title:'Запросить коммерческие предложения на страхование транспорта (КАСКО+ОСАГО)', assigneeId:'u1', assigneeName:'Петров А.В.', creatorId:'u2', creatorName:'Смирнова Н.С.', status:'new', priority:'normal', dueDate:'2026-06-05', procurementId:'p007', createdAt:'2026-05-20T09:00:00', updatedAt:'2026-05-20T09:00:00' },
  { id:'t008', title:'Проверить правомерность закупки мебели — акт приёмки подписан?', assigneeId:'u3', assigneeName:'Козлов Д.М.', creatorId:'u2', creatorName:'Смирнова Н.С.', status:'in_progress', priority:'normal', dueDate:'2026-06-01', procurementId:'p008', createdAt:'2026-05-19T14:00:00', updatedAt:'2026-05-22T09:00:00' },
  { id:'t009', title:'Подготовить проект договора на поставку картриджей к визированию Фёдоровым', assigneeId:'u3', assigneeName:'Козлов Д.М.', creatorId:'u1', creatorName:'Петров А.В.', status:'done', priority:'high', dueDate:'2026-04-20', procurementId:'p001', completedAt:'2026-04-19T17:00:00', createdAt:'2026-04-15T09:00:00', updatedAt:'2026-04-19T17:00:00' },
  { id:'t010', title:'Разместить сведения об исполнении договора Microsoft 365 в ЕАТ', assigneeId:'u6', assigneeName:'Никитин П.А.', creatorId:'u2', creatorName:'Смирнова Н.С.', status:'done', priority:'normal', dueDate:'2026-05-08', procurementId:'p009', completedAt:'2026-05-06T11:00:00', createdAt:'2026-05-03T09:00:00', updatedAt:'2026-05-06T11:00:00' },
];

// ─── ДОГОВОРЫ ────────────────────────────────────────────────────
export interface Contract {
  id: string; number: string; procurementId: string;
  subject: string; supplierName: string; supplierInn: string;
  totalSum: number; paidSum: number;
  signDate: string; endDate: string; actualEndDate?: string;
  status: string; departmentName: string; responsibleName: string;
  isOverdue: boolean;
}

export const MOCK_CONTRACTS: Contract[] = [
  { id:'c001', number:'РЗ-2026-00142/Д-01', procurementId:'p001', subject:'Поставка картриджей для принтеров и МФУ (II кв. 2026)', supplierName:'ООО «ТехноОфис»', supplierInn:'7701234567', totalSum:156400, paidSum:0, signDate:'2026-04-22', endDate:'2026-06-30', status:'execution', departmentName:'Отдел МТО', responsibleName:'Петров А.В.', isOverdue:false },
  { id:'c002', number:'РЗ-2026-00056/Д-01', procurementId:'p004', subject:'Поставка бумаги офисной А4 и А3 (I полугодие 2026)', supplierName:'ЗАО «КанцЛайф»', supplierInn:'5010034782', totalSum:91800, paidSum:0, signDate:'2026-01-28', endDate:'2026-05-31', actualEndDate:'2026-04-15', status:'payment', departmentName:'Отдел МТО', responsibleName:'Петров А.В.', isOverdue:true },
  { id:'c003', number:'РЗ-2026-00098/Д-01', procurementId:'p009', subject:'Лицензии Microsoft 365 Business Premium (50 рабочих мест)', supplierName:'ООО «МоскваСофт»', supplierInn:'7725678901', totalSum:378000, paidSum:378000, signDate:'2026-02-10', endDate:'2026-05-10', actualEndDate:'2026-04-28', status:'eis_reporting', departmentName:'ИТ-отдел', responsibleName:'Никитин П.А.', isOverdue:false },
  { id:'c004', number:'РЗ-2025-00342/Д-01', procurementId:'p006', subject:'Канцелярские товары (IV квартал 2025)', supplierName:'ЗАО «КанцЛайф»', supplierInn:'5010034782', totalSum:54600, paidSum:54600, signDate:'2025-10-22', endDate:'2025-12-31', actualEndDate:'2025-12-20', status:'archive', departmentName:'Отдел МТО', responsibleName:'Орлова Т.В.', isOverdue:false },
  { id:'c005', number:'РЗ-2026-00089/Д-01', procurementId:'p002', subject:'Поставка серверного оборудования для ЦОД (Dell PowerEdge R750, NetApp AFF A250)', supplierName:'ООО «СитиКомп»', supplierInn:'7743012345', totalSum:4720000, paidSum:0, signDate:'2026-05-10', endDate:'2026-07-31', status:'contract_expertise', departmentName:'ИТ-отдел', responsibleName:'Козлов Д.М.', isOverdue:false },
];

// ─── РИСКИ ───────────────────────────────────────────────────────
export interface Risk {
  id: string; procurementId: string; procNum: string;
  title: string; level: 'low'|'medium'|'high'|'critical';
  category: string; description: string;
  mitigation: string; owner: string;
  status: 'open'|'mitigated'|'closed';
  detectedAt: string;
}

export const MOCK_RISKS: Risk[] = [
  { id:'r001', procurementId:'p004', procNum:'РЗ-2026-00056', title:'Просрочка оплаты по договору', level:'high', category:'Финансовый', description:'Срок оплаты по договору с ЗАО «КанцЛайф» истёк. Товар поставлен 15.04.2026, оплата не произведена.', mitigation:'Направить в бухгалтерию служебную записку с требованием ускорить оформление платёжного поручения.', owner:'Волкова Е.И.', status:'open', detectedAt:'2026-05-20T09:00:00' },
  { id:'r002', procurementId:'p002', procNum:'РЗ-2026-00089', title:'Задержка экспертизы договора', level:'medium', category:'Операционный', description:'Договор на серверное оборудование находится на экспертизе в ФЭО более 5 рабочих дней. Плановый срок исполнения — 31.07.2026 под угрозой.', mitigation:'Ускорить рассмотрение в ФЭО, при необходимости эскалировать руководству.', owner:'Козлов Д.М.', status:'open', detectedAt:'2026-05-18T14:00:00' },
  { id:'r003', procurementId:'p009', procNum:'РЗ-2026-00098', title:'Нарушение срока отчётности в ЕИС', level:'high', category:'Нормативный', description:'Отчёт об исполнении договора с ООО «МоскваСофт» не размещён в ЕИС в установленный срок. Риск штрафных санкций по КоАП.', mitigation:'Немедленно разместить отчёт в ЕИС. Провести внутренний разбор причин нарушения.', owner:'Никитин П.А.', status:'open', detectedAt:'2026-05-21T10:00:00' },
  { id:'r004', procurementId:'p001', procNum:'РЗ-2026-00142', title:'Риск непоставки в срок', level:'low', category:'Операционный', description:'ООО «ТехноОфис» сообщил о возможной задержке части позиций (картриджи HP LaserJet CF217A) на 3–5 дней.', mitigation:'Запросить у поставщика официальное письмо с гарантией поставки до 30.06.2026.', owner:'Петров А.В.', status:'mitigated', detectedAt:'2026-05-22T11:00:00' },
  { id:'r005', procurementId:'p008', procNum:'РЗ-2026-00134', title:'Неопределённость победителя торгов', level:'medium', category:'Процедурный', description:'Котировочная сессия по офисной мебели завершается 25.05.2026. Поступило только 2 ценовых предложения из ожидаемых 4.', mitigation:'Проверить корректность публикации. При необходимости продлить сессию или объявить повторную.', owner:'Петров А.В.', status:'open', detectedAt:'2026-05-22T09:00:00' },
];

// ─── АНАЛИТИКА ───────────────────────────────────────────────────
export const ANALYTICS_MONTHLY = [
  { month:'Янв', count:2, sum:472500, economy:8400 },
  { month:'Фев', count:1, sum:4850000, economy:0 },
  { month:'Мар', count:0, sum:0, economy:0 },
  { month:'Апр', count:3, sum:693700, economy:11000 },
  { month:'Май', count:4, sum:2555000, economy:125900 },
  { month:'Июн', count:1, sum:162000, economy:5600 },
];

export const KPI_DATA = {
  inTimePct: 87,
  economyTotal: 145300,
  economyPct: 1.7,
  avgApprovalDays: 3.2,
  overdueCount: 2,
  totalCompleted: 3,
};

export const ANALYTICS_BY_STATUS = [
  { name:'СЗ в МТО',           value:2,  color:'#94a3b8' },
  { name:'Согласование',        value:1,  color:'#fbbf24' },
  { name:'Подготовка',          value:1,  color:'#60a5fa' },
  { name:'Торги',               value:1,  color:'#a78bfa' },
  { name:'Экспертиза договора', value:1,  color:'#22d3ee' },
  { name:'Исполнение',          value:1,  color:'#34d399' },
  { name:'Оплата',              value:1,  color:'#86efac' },
  { name:'Отчётность ЕИС',      value:1,  color:'#7dd3fc' },
  { name:'Архив',               value:1,  color:'#cbd5e1' },
];

export const ANALYTICS_BY_DEPARTMENT = [
  { dept:'Отдел МТО',   count:6, sum:1024300 },
  { dept:'ИТ-отдел',    count:3, sum:7085000 },
  { dept:'АХО',         count:3, sum:1050000 },
  { dept:'Бухгалтерия', count:0, sum:0 },
];

// ─── ЖУРНАЛ АУДИТА ────────────────────────────────────────────────
export const MOCK_AUDIT_LOGS = [
  { id:'al001', userId:'u1', userName:'Петров А.В.', userRole:'specialist_mto', action:'status_change', entityType:'procurement', entityId:'p001', description:'Статус закупки РЗ-2026-00142 изменён: Договор подписан → Исполнение', ipAddress:'10.10.1.45', createdAt:'2026-05-10T14:30:00' },
  { id:'al002', userId:'u3', userName:'Козлов Д.М.', userRole:'contract_manager', action:'status_change', entityType:'procurement', entityId:'p002', description:'Статус закупки РЗ-2026-00089 изменён: Согласование победителя → Экспертиза договора', ipAddress:'10.10.1.47', createdAt:'2026-05-18T11:15:00' },
  { id:'al003', userId:'u1', userName:'Петров А.В.', userRole:'specialist_mto', action:'CREATE', entityType:'procurement', entityId:'p003', description:'Создана новая закупка РЗ-2026-00178: Уборка помещений', ipAddress:'10.10.1.45', createdAt:'2026-05-15T09:00:00' },
  { id:'al004', userId:'u6', userName:'Никитин П.А.', userRole:'specialist_mto', action:'UPLOAD', entityType:'document', entityId:'doc-p005-tz', description:'Загружено ТЗ для закупки СМЭВ-адаптера (ТЗ_СМЭВ_v2.pdf, 245 КБ)', ipAddress:'10.10.1.52', createdAt:'2026-05-16T10:30:00' },
  { id:'al005', userId:'u2', userName:'Смирнова Н.С.', userRole:'head_department', action:'APPROVE', entityType:'procurement', entityId:'p001', description:'Согласован победитель торгов: ООО «ТехноОфис» (156 400 руб.)', ipAddress:'10.10.1.46', createdAt:'2026-04-18T14:00:00' },
  { id:'al006', userId:'u5', userName:'Фёдоров С.В.', userRole:'management', action:'APPROVE', entityType:'note', entityId:'sz2', description:'Согласована служебная записка АХО на уборку помещений', ipAddress:'10.10.1.50', createdAt:'2026-05-20T11:30:00' },
  { id:'al007', userId:'u4', userName:'Волкова Е.И.', userRole:'accountant', action:'PAYMENT', entityType:'contract', entityId:'c003', description:'Оформлено платёжное поручение №ПП-2026-0892 на сумму 378 000 руб. (Microsoft 365)', ipAddress:'10.10.1.48', createdAt:'2026-05-06T16:00:00' },
  { id:'al008', userId:'u1', userName:'Петров А.В.', userRole:'specialist_mto', action:'EXPORT', entityType:'report', entityId:'rep-registry', description:'Выгружен реестр закупок в CSV (10 записей, 28 КБ)', ipAddress:'10.10.1.45', createdAt:'2026-05-22T09:15:00' },
  { id:'al009', userId:'u6', userName:'Никитин П.А.', userRole:'specialist_mto', action:'status_change', entityType:'procurement', entityId:'p009', description:'Статус изменён: Исполнение → Отчётность в ЕИС', ipAddress:'10.10.1.52', createdAt:'2026-05-05T16:00:00' },
  { id:'al010', userId:'u1', userName:'Петров А.В.', userRole:'specialist_mto', action:'VIEW', entityType:'procurement', entityId:'p002', description:'Просмотр карточки закупки РЗ-2026-00089 (серверное оборудование)', ipAddress:'10.10.1.45', createdAt:'2026-05-22T10:45:00' },
];
