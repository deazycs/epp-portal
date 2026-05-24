import type { Notification, Task, HistoryEntry, Document, AuditLog, Contract, Risk } from '@/types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'warning', category: 'deadline', title: 'Просрочка платежа по договору', message: 'По закупке РЗ-2026-00056 «Поставка бумаги» срок оплаты истёк 4 дня назад. Необходимо инициировать платёжное поручение.', link: '/zakupki/p004', entityId: 'p004', entityType: 'procurement', isRead: false, createdAt: '2026-05-15T10:00:00' },
  { id: 'n2', userId: 'u1', type: 'info', category: 'approval', title: 'Направлено на согласование', message: 'Закупка РЗ-2026-00178 «Услуги уборки» направлена на согласование начальником АХО.', link: '/soglasovaniya', entityId: 'p003', entityType: 'procurement', isRead: false, createdAt: '2026-05-18T14:30:00' },
  { id: 'n3', userId: 'u1', type: 'success', category: 'approval', title: 'Закупка согласована', message: 'Закупка РЗ-2026-00134 «Офисная мебель» согласована. Можно переходить к следующему этапу.', link: '/zakupki/p008', entityId: 'p008', entityType: 'procurement', isRead: true, createdAt: '2026-05-14T09:15:00', readAt: '2026-05-14T10:00:00' },
  { id: 'n4', userId: 'u1', type: 'warning', category: 'deadline', title: 'Срок размещения в ЕИС истекает', message: 'По закупке РЗ-2026-00098 «Microsoft 365» необходимо разместить отчёт об исполнении в ЕИС до 23.05.2026.', link: '/zakupki/p009', entityId: 'p009', entityType: 'procurement', isRead: false, createdAt: '2026-05-19T08:00:00' },
  { id: 'n5', userId: 'u1', type: 'info', category: 'task', title: 'Новая задача назначена', message: 'Смирнова Н.С. назначила задачу: «Проверить комплектность документов по договору с ООО ТехноОфис»', link: '/zadachi', isRead: false, createdAt: '2026-05-17T16:45:00' },
  { id: 'n6', userId: 'u1', type: 'error', category: 'document', title: 'Отсутствует ТЗ', message: 'По закупке РЗ-2026-00203 «СМЭВ-адаптер» не загружено техническое задание. Без него невозможно разместить извещение в ЕИС.', link: '/zakupki/p005', entityId: 'p005', entityType: 'procurement', isRead: false, createdAt: '2026-05-19T07:30:00' },
  { id: 'n7', userId: 'u1', type: 'success', category: 'payment', title: 'Оплата проведена', message: 'По договору с ООО «МоскваСофт» (Microsoft 365) проведена оплата 378 000,00 руб.', link: '/zakupki/p009', entityId: 'p009', entityType: 'procurement', isRead: true, createdAt: '2026-05-01T13:00:00', readAt: '2026-05-01T14:00:00' },
  { id: 'n8', userId: 'u1', type: 'info', category: 'system', title: 'Плановое обновление системы', message: 'В субботу 23.05.2026 с 22:00 до 02:00 проводится плановое ТО системы. Сохраните незавершённую работу.', isRead: false, createdAt: '2026-05-19T09:00:00' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Проверить комплектность документов по картриджам', description: 'Сверить документы согласно чек-листу: договор, ТЗ, акт приёмки, счёт-фактура, товарная накладная', status: 'new', priority: 'high', assigneeId: 'u1', assigneeName: 'Петров А.В.', creatorId: 'u2', creatorName: 'Смирнова Н.С.', procurementId: 'p001', dueDate: '2026-05-23', createdAt: '2026-05-17T16:45:00', updatedAt: '2026-05-17T16:45:00', tags: ['документы', 'приоритетная'], subtasks: [{ id: 'st1', parentId: 't1', title: 'Проверить договор', done: true }, { id: 'st2', parentId: 't1', title: 'Проверить акт приёмки', done: false }, { id: 'st3', parentId: 't1', title: 'Проверить счёт-фактуру', done: false }] },
  { id: 't2', title: 'Разработать ТЗ на СМЭВ-адаптер', description: 'Согласовать требования с ИТ-отделом и ЦАОЗ, оформить ТЗ по ГОСТ 34.602-2020', status: 'in_progress', priority: 'high', assigneeId: 'u6', assigneeName: 'Никитин П.А.', creatorId: 'u1', creatorName: 'Петров А.В.', procurementId: 'p005', dueDate: '2026-05-28', createdAt: '2026-05-10T10:00:00', updatedAt: '2026-05-18T11:00:00', tags: ['ТЗ', 'ИТ'] },
  { id: 't3', title: 'Запросить КП от клининговых компаний', status: 'done', priority: 'normal', assigneeId: 'u7', assigneeName: 'Орлова Т.В.', creatorId: 'u1', creatorName: 'Петров А.В.', procurementId: 'p003', dueDate: '2026-05-16', completedAt: '2026-05-15T15:00:00', createdAt: '2026-05-10T09:00:00', updatedAt: '2026-05-15T15:00:00', tags: ['КП'] },
  { id: 't4', title: 'Инициировать оплату по бумаге А4', description: 'Подготовить пакет документов для бухгалтерии: счёт, акт, договор, заявка на оплату', status: 'overdue', priority: 'urgent', assigneeId: 'u1', assigneeName: 'Петров А.В.', creatorId: 'u2', creatorName: 'Смирнова Н.С.', procurementId: 'p004', dueDate: '2026-05-15', createdAt: '2026-05-12T09:00:00', updatedAt: '2026-05-12T09:00:00', tags: ['оплата', 'просрочено'] },
  { id: 't5', title: 'Опубликовать извещение о закупке мебели в ЕАТ', status: 'in_progress', priority: 'normal', assigneeId: 'u1', assigneeName: 'Петров А.В.', creatorId: 'u7', creatorName: 'Орлова Т.В.', procurementId: 'p008', dueDate: '2026-05-22', createdAt: '2026-05-14T10:00:00', updatedAt: '2026-05-18T09:00:00', tags: ['ЕАТ', 'публикация'] },
];

export const MOCK_HISTORY: HistoryEntry[] = [
  { id: 'h1', entityId: 'p001', entityType: 'procurement', userId: 'u1', userName: 'Петров А.В.', action: 'status_change', fieldName: 'status', oldValue: 'awaiting_supplier', newValue: 'contract_signing', description: 'Статус изменён: «Ожидание поставщика» → «Заключение договора»', createdAt: '2026-04-14T11:30:00', ipAddress: '10.10.1.45' },
  { id: 'h2', entityId: 'p001', entityType: 'procurement', userId: 'u3', userName: 'Козлов Д.М.', action: 'document_upload', description: 'Загружен документ: «Договор РЗ-2026-00142 с ООО ТехноОфис.pdf»', createdAt: '2026-04-18T14:00:00', ipAddress: '10.10.1.12' },
  { id: 'h3', entityId: 'p001', entityType: 'procurement', userId: 'u1', userName: 'Петров А.В.', action: 'status_change', fieldName: 'status', oldValue: 'contract_signing', newValue: 'execution', description: 'Статус изменён: «Заключение договора» → «Исполнение»', createdAt: '2026-04-18T15:00:00', ipAddress: '10.10.1.45' },
  { id: 'h4', entityId: 'p001', entityType: 'procurement', userId: 'u1', userName: 'Петров А.В.', action: 'field_update', fieldName: 'contractSum', oldValue: '162000', newValue: '156400', description: 'Обновлена сумма договора: 162 000 → 156 400 руб.', createdAt: '2026-04-18T15:05:00', ipAddress: '10.10.1.45' },
  { id: 'h5', entityId: 'p004', entityType: 'procurement', userId: 'u4', userName: 'Волкова Е.И.', action: 'payment_issue', description: 'Зафиксирована просрочка платежа. Срок оплаты 15.05.2026 истёк.', createdAt: '2026-05-16T09:00:00', ipAddress: '10.10.1.22' },
];

export const MOCK_CONTRACTS: Contract[] = [
  { id: 'c1', number: 'РЗ-2026-00142/Д', procurementId: 'p001', procurementTitle: 'Поставка картриджей', supplierId: 's1', supplierName: 'ООО «ТехноОфис»', supplierInn: '7701234567', status: 'active', subject: 'Поставка расходных материалов для оргтехники', totalSum: 156400, paidSum: 0, signDate: '2026-04-18', startDate: '2026-04-18', endDate: '2026-06-30', departmentId: 'd1', departmentName: 'Отдел МТО', responsibleId: 'u1', responsibleName: 'Петров А.В.', documentIds: ['doc1', 'doc2'], isOverdue: false, payments: [], executions: [] },
  { id: 'c2', number: 'РЗ-2026-00089/Д', procurementId: 'p002', procurementTitle: 'Серверное оборудование', supplierId: 's3', supplierName: 'ООО «СитиКомп»', supplierInn: '7743012345', status: 'draft', subject: 'Поставка серверов и СХД', totalSum: 4720000, paidSum: 0, signDate: '2026-06-01', startDate: '2026-06-01', endDate: '2026-09-30', departmentId: 'd4', departmentName: 'ИТ-отдел', responsibleId: 'u3', responsibleName: 'Козлов Д.М.', documentIds: ['doc4'], isOverdue: false, payments: [], executions: [] },
  { id: 'c3', number: 'РЗ-2026-00056/Д', procurementId: 'p004', procurementTitle: 'Поставка бумаги А4', supplierId: 's2', supplierName: 'ЗАО «КанцЛайф»', supplierInn: '5010034782', status: 'executed', subject: 'Поставка офисной бумаги А4 и А3', totalSum: 91800, paidSum: 0, signDate: '2026-01-28', startDate: '2026-01-28', endDate: '2026-05-31', actualEndDate: '2026-04-15', departmentId: 'd1', departmentName: 'Отдел МТО', responsibleId: 'u1', responsibleName: 'Петров А.В.', documentIds: ['doc9'], isOverdue: true, payments: [], executions: [] },
  { id: 'c4', number: 'РЗ-2026-00098/Д', procurementId: 'p009', procurementTitle: 'Лицензии Microsoft 365', supplierId: 's5', supplierName: 'ООО «МоскваСофт»', supplierInn: '7725678901', status: 'executed', subject: 'Поставка лицензий Microsoft 365 Business Premium', totalSum: 378000, paidSum: 378000, signDate: '2026-02-10', startDate: '2026-02-10', endDate: '2026-05-10', actualEndDate: '2026-04-28', departmentId: 'd4', departmentName: 'ИТ-отдел', responsibleId: 'u6', responsibleName: 'Никитин П.А.', documentIds: ['doc16', 'doc17'], isOverdue: false, payments: [], executions: [] },
];

export const MOCK_RISKS: Risk[] = [
  { id: 'r1', procurementId: 'p004', title: 'Просрочка платежа — ЗАО КанцЛайф ожидает оплату', description: 'Срок оплаты по договору РЗ-2026-00056/Д истёк 15.05.2026. Просрочка 4 дня. Риск штрафных санкций.', level: 'high', category: 'deadline', status: 'open', responsibleId: 'u1', responsibleName: 'Петров А.В.', identifiedAt: '2026-05-16T08:00:00', dueDate: '2026-05-22', mitigationPlan: 'Срочно передать пакет документов в бухгалтерию для оформления платёжного поручения' },
  { id: 'r2', procurementId: 'p005', title: 'Отсутствует ТЗ — невозможно опубликовать в ЕИС', description: 'Разработка ТЗ на СМЭВ-адаптер затягивается. Без утверждённого ТЗ нельзя разместить извещение в ЕИС.', level: 'high', category: 'document', status: 'open', responsibleId: 'u6', responsibleName: 'Никитин П.А.', identifiedAt: '2026-05-15T09:00:00', dueDate: '2026-05-28', mitigationPlan: 'Никитин П.А. завершает ТЗ к 28.05.2026, согласование с ИТ-отделом параллельно' },
  { id: 'r3', procurementId: 'p002', title: 'Высокая стоимость — риск недобросовестного поставщика', description: 'Закупка серверного оборудования на 4,72 млн руб. Необходима тщательная проверка победителя торгов.', level: 'medium', category: 'supplier', status: 'open', responsibleId: 'u3', responsibleName: 'Козлов Д.М.', identifiedAt: '2026-05-10T14:00:00', dueDate: '2026-06-10', mitigationPlan: 'Провести проверку по реестру недобросовестных поставщиков перед подписанием договора' },
  { id: 'r4', procurementId: 'p003', title: 'Длительное согласование — срыв старта услуг с 01.07.2026', description: 'Закупка на согласовании 4 дня. При задержке не успеем заключить договор до 01.07.2026.', level: 'medium', category: 'compliance', status: 'open', responsibleId: 'u7', responsibleName: 'Орлова Т.В.', identifiedAt: '2026-05-18T10:00:00', dueDate: '2026-06-01', mitigationPlan: 'Ускорить согласование через руководителя отдела, параллельно начать сбор КП' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al1', userId: 'u1', userName: 'Петров А.В.', userRole: 'specialist_mto', action: 'ВХОД', module: 'Авторизация', description: 'Вход в систему', ipAddress: '10.10.1.45', userAgent: 'Mozilla/5.0 (Windows NT 10.0)', timestamp: '2026-05-20T08:15:00', result: 'success' },
  { id: 'al2', userId: 'u1', userName: 'Петров А.В.', userRole: 'specialist_mto', action: 'ПРОСМОТР', module: 'Реестр закупок', entityId: 'p001', entityType: 'procurement', description: 'Просмотр карточки закупки РЗ-2026-00142', ipAddress: '10.10.1.45', userAgent: 'Mozilla/5.0', timestamp: '2026-05-20T08:22:00', result: 'success' },
  { id: 'al3', userId: 'u2', userName: 'Смирнова Н.С.', userRole: 'head_department', action: 'СОГЛАСОВАНИЕ', module: 'Согласования', entityId: 'p008', entityType: 'procurement', description: 'Согласована закупка РЗ-2026-00134 «Офисная мебель»', ipAddress: '10.10.1.33', userAgent: 'Mozilla/5.0', timestamp: '2026-05-14T09:15:00', result: 'success' },
  { id: 'al4', userId: 'u1', userName: 'Петров А.В.', userRole: 'specialist_mto', action: 'СОЗДАНИЕ', module: 'Закупки', entityId: 'p007', entityType: 'procurement', description: 'Создана закупка РЗ-2026-00219 «Страхование имущества»', ipAddress: '10.10.1.45', userAgent: 'Mozilla/5.0', timestamp: '2026-05-19T11:00:00', result: 'success' },
  { id: 'al5', userId: 'u3', userName: 'Козлов Д.М.', userRole: 'contract_manager', action: 'ЗАГРУЗКА', module: 'Документы', entityId: 'doc2', entityType: 'document', description: 'Загружен документ: Договор РЗ-2026-00142/Д.pdf', ipAddress: '10.10.1.12', userAgent: 'Mozilla/5.0', timestamp: '2026-04-18T14:00:00', result: 'success' },
  { id: 'al6', userId: 'u4', userName: 'Волкова Е.И.', userRole: 'accountant', action: 'ОПЛАТА', module: 'Платежи', entityId: 'c4', entityType: 'dogovor', description: 'Проведён платёж 378 000 руб. — Microsoft 365', ipAddress: '10.10.1.22', userAgent: 'Mozilla/5.0', timestamp: '2026-05-01T13:00:00', result: 'success' },
  { id: 'al7', userId: 'u5', userName: 'Фёдоров С.В.', userRole: 'management', action: 'ПРОСМОТР', module: 'Панель руководителя', description: 'Просмотр аналитики за апрель 2026', ipAddress: '10.10.1.5', userAgent: 'Mozilla/5.0', timestamp: '2026-05-05T10:00:00', result: 'success' },
  { id: 'al8', userId: 'u8', userName: 'Сис. Администратор', userRole: 'admin', action: 'НАСТРОЙКА', module: 'Настройки', description: 'Обновлены настройки уведомлений о сроках', ipAddress: '10.10.1.1', userAgent: 'Mozilla/5.0', timestamp: '2026-05-12T09:00:00', result: 'success' },
];

export const ANALYTICS_MONTHLY = [
  { month: 'Янв', count: 6, sum: 520000, completed: 5 },
  { month: 'Фев', count: 8, sum: 1140000, completed: 7 },
  { month: 'Мар', count: 10, sum: 980000, completed: 8 },
  { month: 'Апр', count: 14, sum: 5870000, completed: 9 },
  { month: 'Май', count: 9, sum: 760000, completed: 3 },
  { month: 'Июн', count: 3, sum: 375000, completed: 0 },
];

export const ANALYTICS_BY_STATUS = [
  { name: 'Черновик', value: 1 },
  { name: 'На согласовании', value: 1 },
  { name: 'Подготовка ТЗ', value: 1 },
  { name: 'В ЕАТ/ЕИС', value: 2 },
  { name: 'Исполнение', value: 2 },
  { name: 'Оплата/Закрытие', value: 2 },
  { name: 'Архив', value: 1 },
];

export const ANALYTICS_BY_DEPARTMENT = [
  { name: 'Отдел МТО', count: 16, sum: 1280000 },
  { name: 'ИТ-отдел', count: 14, sum: 7005000 },
  { name: 'АХО', count: 12, sum: 755000 },
  { name: 'Бухгалтерия', count: 4, sum: 135000 },
  { name: 'Юротдел', count: 3, sum: 98000 },
  { name: 'ОК', count: 2, sum: 57000 },
];
