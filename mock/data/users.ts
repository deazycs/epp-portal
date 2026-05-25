'use client';

// ═══════════════════════════════════════════════════════════════
// РЕАЛЬНЫЕ СОТРУДНИКИ РОСРЕЕСТРА — Управление по Воронежской области
// Данные актуальны на 2026 год
// ═══════════════════════════════════════════════════════════════

export interface User {
  id: string;
  name: string;
  nameShort: string;   // Фамилия И.О.
  position: string;
  dept: string;
  deptShort: string;
  email: string;
  phone?: string;
  ext?: string;        // Внутренний номер
  role: 'mto_specialist' | 'mto_head' | 'deputy_head' | 'feo' | 'legal' | 'it_head' | 'dept_head' | 'initiator' | 'admin' | 'management' | 'specialist_mto' | 'head_department' | 'contract_manager' | 'accountant';
  canInitiateSZ: boolean;   // Может подавать СЗ
  canCreateOrder: boolean;  // Может создавать закупку (только МТО)
  canSignContract: boolean; // Может подписывать договор
  canApproveContract: boolean; // Может визировать договор
  avatarColor: string;
}

// ─── РУКОВОДСТВО ─────────────────────────────────────────────
export const USERS: User[] = [
  {
    id: 'u_tol',
    name: 'Толоконников Юрий Васильевич',
    nameShort: 'Толоконников Ю.В.',
    position: 'Заместитель руководителя',
    dept: 'Руководство',
    deptShort: 'Руководство',
    email: 'tolokonnukov@r36.rosreestr.ru',
    role: 'deputy_head',
    canInitiateSZ: false,
    canCreateOrder: false,
    canSignContract: true,   // Уполномоченное лицо на подписание
    canApproveContract: true, // Визирует договора
    avatarColor: 'bg-purple-700',
  },

  // ─── ОТДЕЛ МТО ───────────────────────────────────────────
  {
    id: 'u_che',
    name: 'Черемных Марина Юрьевна',
    nameShort: 'Черемных М.Ю.',
    position: 'Начальник отдела МТО',
    dept: 'Отдел материально-технического обеспечения',
    deptShort: 'Отдел МТО',
    email: 'u361304@r36.rosreestr.ru',
    phone: '8(473) 210-76-18',
    ext: '3027',
    role: 'mto_head',
    canInitiateSZ: true,
    canCreateOrder: true,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-green-700',
  },
  {
    id: 'u_shc',
    name: 'Щетинина Наталья Сергеевна',
    nameShort: 'Щетинина Н.С.',
    position: 'Заместитель начальника отдела МТО',
    dept: 'Отдел материально-технического обеспечения',
    deptShort: 'Отдел МТО',
    email: 'u361308@r36.rosreestr.ru',
    phone: '8(473) 210-76-37',
    ext: '3028',
    role: 'mto_specialist',
    canInitiateSZ: true,
    canCreateOrder: true,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-green-600',
  },
  {
    id: 'u_bol',
    name: 'Болдина Алла Викторовна',
    nameShort: 'Болдина А.В.',
    position: 'Главный специалист-эксперт',
    dept: 'Отдел материально-технического обеспечения',
    deptShort: 'Отдел МТО',
    email: 'u361309@r36.rosreestr.ru',
    ext: '3054',
    role: 'mto_specialist',
    canInitiateSZ: true,
    canCreateOrder: true,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-green-500',
  },
  {
    id: 'u_shv',
    name: 'Швецов Кирилл Евгеньевич',
    nameShort: 'Швецов К.Е.',
    position: 'Ведущий специалист-эксперт',
    dept: 'Отдел материально-технического обеспечения',
    deptShort: 'Отдел МТО',
    email: 'u360516@r36.rosreestr.ru',
    phone: '8(473) 210-76-37',
    ext: '3159',
    role: 'mto_specialist',
    canInitiateSZ: true,
    canCreateOrder: true,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-blue-600',
  },
  {
    id: 'u_rybalk',
    name: 'Рыбалка Наталья Сергеевна',
    nameShort: 'Рыбалка Н.С.',
    position: 'Главный специалист-эксперт',
    dept: 'Отдел материально-технического обеспечения',
    deptShort: 'Отдел МТО',
    email: 'u361323@r36.rosreestr.ru',
    phone: '8(473) 210-76-08',
    ext: '3156',
    role: 'mto_specialist',
    canInitiateSZ: true,
    canCreateOrder: true,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-teal-600',
  },

  // ─── ИТ ОТДЕЛ (инициатор) ────────────────────────────────
  {
    id: 'u_mit',
    name: 'Митусов Сергей Александрович',
    nameShort: 'Митусов С.А.',
    position: 'Начальник отдела эксплуатации ИС',
    dept: 'Отдел эксплуатации информационных систем, технических средств и каналов связи',
    deptShort: 'ИТ-отдел',
    email: 'u361501@r36.rosreestr.ru',
    phone: '8(473) 210-76-10',
    ext: '3000',
    role: 'dept_head',
    canInitiateSZ: true,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-blue-700',
  },
  {
    id: 'u_boev',
    name: 'Боев Станислав Егорович',
    nameShort: 'Боев С.Е.',
    position: 'Заместитель начальника ИТ-отдела',
    dept: 'Отдел эксплуатации информационных систем, технических средств и каналов связи',
    deptShort: 'ИТ-отдел',
    email: 'u361402@r36.rosreestr.ru',
    phone: '8(473) 252-57-86',
    ext: '3033',
    role: 'initiator',
    canInitiateSZ: true,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-blue-500',
  },

  // ─── ОТДЕЛ ОБЩЕГО ОБЕСПЕЧЕНИЯ (инициатор) ────────────────
  {
    id: 'u_dav',
    name: 'Давыдова Фатима Аскеровна',
    nameShort: 'Давыдова Ф.А.',
    position: 'Начальник отдела общего обеспечения',
    dept: 'Отдел общего обеспечения',
    deptShort: 'ОО',
    email: 'u361201@r36.rosreestr.ru',
    phone: '8(473) 210-76-24',
    ext: '3044',
    role: 'dept_head',
    canInitiateSZ: true,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-orange-600',
  },
  {
    id: 'u_bond',
    name: 'Бондарь Юлия Николаевна',
    nameShort: 'Бондарь Ю.Н.',
    position: 'Заместитель начальника ОО',
    dept: 'Отдел общего обеспечения',
    deptShort: 'ОО',
    email: 'u361219@r36.rosreestr.ru',
    phone: '8(473) 235-50-90',
    ext: '3046',
    role: 'initiator',
    canInitiateSZ: true,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-orange-500',
  },

  // ─── ОТДЕЛ ЗАЩИТЫ ГОС. ТАЙНЫ (инициатор) ────────────────
  {
    id: 'u_sch',
    name: 'Щербинин Роман Сергеевич',
    nameShort: 'Щербинин Р.С.',
    position: 'Начальник отдела по защите гос. тайны',
    dept: 'Отдел по защите гос. тайны и мобилизационной подготовки',
    deptShort: 'ОГТ',
    email: 'u361703@r36.rosreestr.ru',
    phone: '8(473) 252-12-27',
    ext: '3032',
    role: 'dept_head',
    canInitiateSZ: true,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: false,
    avatarColor: 'bg-gray-700',
  },

  // ─── ФЭО ─────────────────────────────────────────────────
  {
    id: 'u_pik',
    name: 'Пикинер Ольга Владимировна',
    nameShort: 'Пикинер О.В.',
    position: 'Начальник финансово-экономического отдела',
    dept: 'Финансово-экономический отдел',
    deptShort: 'ФЭО',
    email: 'u360501@r36.rosreestr.ru',
    phone: '8(473) 264-93-34',
    ext: '1020',
    role: 'feo',
    canInitiateSZ: false,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: true,  // ФЭО визирует договор
    avatarColor: 'bg-yellow-600',
  },

  // ─── ПРАВОВОЙ ОТДЕЛ ──────────────────────────────────────
  {
    id: 'u_sad',
    name: 'Садовая Елена Николаевна',
    nameShort: 'Садовая Е.Н.',
    position: 'Начальник отдела правового обеспечения',
    dept: 'Отдел правового обеспечения',
    deptShort: 'Правовой отдел',
    email: 'u361123@r36.rosreestr.ru',
    phone: '8(473) 264-93-54',
    ext: '1033',
    role: 'legal',
    canInitiateSZ: false,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: true,  // Правовой визирует договор
    avatarColor: 'bg-red-700',
  },
  {
    id: 'u_sek',
    name: 'Секирин Александр Иванович',
    nameShort: 'Секирин А.И.',
    position: 'Заместитель начальника правового отдела',
    dept: 'Отдел правового обеспечения',
    deptShort: 'Правовой отдел',
    email: 'u361109@r36.rosreestr.ru',
    phone: '8(473) 264-93-56',
    ext: '1408',
    role: 'legal',
    canInitiateSZ: false,
    canCreateOrder: false,
    canSignContract: false,
    canApproveContract: true,
    avatarColor: 'bg-red-600',
  },
];

// ─── ОТДЕЛЫ-ИНИЦИАТОРЫ (могут подавать СЗ) ──────────────────
export const INITIATING_DEPTS = [
  { id: 'mto',  name: 'Отдел МТО',        short: 'МТО',      head: 'Черемных М.Ю.',    color: 'bg-green-100 text-green-800' },
  { id: 'it',   name: 'ИТ-отдел',         short: 'ИТ-отдел', head: 'Митусов С.А.',     color: 'bg-blue-100 text-blue-800' },
  { id: 'oo',   name: 'Отдел общего обеспечения', short: 'ОО', head: 'Давыдова Ф.А.', color: 'bg-orange-100 text-orange-800' },
  { id: 'ogt',  name: 'Отдел по защите гос. тайны', short: 'ОГТ', head: 'Щербинин Р.С.', color: 'bg-gray-100 text-gray-800' },
];

// ─── ПОЛНЫЙ СПИСОК ОТДЕЛОВ (для СЗ) ─────────────────────────
export const ALL_DEPTS = [
  'Отдел МТО',
  'ИТ-отдел (Отдел эксплуатации ИС)',
  'Отдел общего обеспечения',
  'Отдел по защите гос. тайны и моб. подготовки',
  'Финансово-экономический отдел',
  'Отдел правового обеспечения',
  'Руководство',
];

// ─── КБК РОСРЕЕСТРА — УПРАВЛЕНИЕ ПО ВОРОНЕЖСКОЙ ОБЛАСТИ ─────
export const KBK_LIST = [
  {
    code: '321 0412 54 4 01 90071 247',
    name: 'Закупка товаров, работ, услуг (ПОДФД 90071)',
    kosgu: ['347'],
    kosguNames: ['347 — Увеличение стоимости мат. запасов для целей капвложений'],
    types: ['goods', 'materials'],
  },
  {
    code: '321 0412 54 4 01 90071 244',
    name: 'Прочие закупки (ПОДФД 90071)',
    kosgu: ['341', '342', '343', '344', '345', '346', '347', '349'],
    kosguNames: [
      '341 — Увеличение стоимости лекарственных препаратов',
      '342 — Увеличение стоимости продуктов питания',
      '343 — Увеличение стоимости ГСМ',
      '344 — Увеличение стоимости расходных материалов (картриджи, канцтовары, бумага)',
      '345 — Увеличение стоимости мягкого инвентаря',
      '346 — Увеличение стоимости прочих мат. запасов',
      '347 — Увеличение стоимости мат. запасов для капвложений',
      '349 — Увеличение стоимости прочих мат. запасов (разовое)',
    ],
    types: ['goods', 'materials', 'it_consumables'],
  },
  {
    code: '321 0412 54 4 01 90020 244',
    name: 'Прочие закупки (ПОДФД 90020)',
    kosgu: ['344', '346', '349'],
    kosguNames: [
      '344 — Расходные материалы',
      '346 — Прочие материальные запасы',
      '349 — Прочие материалы (одноразовое потребление)',
    ],
    types: ['goods', 'materials'],
  },
  {
    code: '321 0412 54 4 01 90020 243',
    name: 'Закупка услуг связи, коммунальных и прочих (ПОДФД 90020)',
    kosgu: ['221', '222', '223', '224', '225', '226'],
    kosguNames: [
      '221 — Услуги связи',
      '222 — Транспортные услуги',
      '223 — Коммунальные услуги',
      '224 — Арендная плата за пользование имуществом',
      '225 — Работы, услуги по содержанию имущества (ТО, уборка, охрана)',
      '226 — Прочие работы и услуги (ИТ-услуги, разработка, обучение)',
    ],
    types: ['services', 'it_services'],
  },
  {
    code: '321 0412 54 4 01 90020 242',
    name: 'Закупка товаров в сфере ИТ (ПОДФД 90020)',
    kosgu: ['310', '320', '226'],
    kosguNames: [
      '310 — Увеличение стоимости ОС (компьютеры, серверы, оргтехника стоимостью >100 тыс.)',
      '320 — Увеличение стоимости нематериальных активов (ПО, лицензии >100 тыс.)',
      '226 — Прочие услуги в сфере ИТ',
    ],
    types: ['it_equipment', 'software'],
  },
  {
    code: '321 0412 54 4 01 90019 244',
    name: 'Закупки по ПОДФД 90019 (прочие нужды)',
    kosgu: ['226', '310', '344', '346'],
    kosguNames: [
      '226 — Прочие работы и услуги',
      '310 — Увеличение стоимости основных средств',
      '344 — Расходные материалы',
      '346 — Прочие материальные запасы',
    ],
    types: ['goods', 'services', 'it_equipment'],
  },
];

// ─── ПОДБОР КБК ПО ТИПУ ЗАКУПКИ ─────────────────────────────
export function getKbkForType(procType: string, kosgu?: string): string {
  if (procType === 'it_equipment' || procType === 'software') {
    return '321 0412 54 4 01 90020 242';
  }
  if (procType === 'it_services') {
    return '321 0412 54 4 01 90020 243';
  }
  if (procType === 'services') {
    return '321 0412 54 4 01 90020 243';
  }
  return '321 0412 54 4 01 90020 244';
}

// ─── УПОЛНОМОЧЕННЫЕ ПО ПРИЁМКЕ ───────────────────────────────
// Зависит от КОСГУ / типа закупки
export function getAcceptancePersons(procTitle: string, kosgu?: string): typeof USERS {
  const title = procTitle.toLowerCase();
  const k = kosgu ?? '';

  // 242 — компьютеры, серверы, оргтехника → Митусов С.А.
  if (k === '310' || k === '320' || k.includes('242') ||
      title.includes('компьютер') || title.includes('сервер') ||
      title.includes('картридж') || title.includes('принтер') ||
      title.includes('лицензи') || title.includes('программ') ||
      title.includes('ит') || title.includes('телефон')) {
    return USERS.filter(u => ['u_mit', 'u_boev'].includes(u.id));
  }

  // Охрана → Щербинин Р.С.
  if (title.includes('охран') || title.includes('безопасност') || title.includes('сигнализ')) {
    return USERS.filter(u => u.id === 'u_sch');
  }

  // Канцелярия, офисные товары → Давыдова Ф.А.
  if (title.includes('канцел') || title.includes('бумаг') || title.includes('папк') ||
      title.includes('ручк') || title.includes('офисн')) {
    return USERS.filter(u => u.id === 'u_dav');
  }

  // Всё остальное (мебель, ТО, уборка, ГСМ, расходники МТО) → Черемных М.Ю.
  return USERS.filter(u => u.id === 'u_che');
}

// ─── ПЕРСОНАЖИ ДЛЯ ЭКРАНА ВХОДА ─────────────────────────────
export const LOGIN_USERS = [
  {
    userId: 'u_shv',
    name: 'Швецов Кирилл Евгеньевич',
    role: 'Ведущий специалист-эксперт МТО',
    dept: 'Отдел МТО',
    avatar: 'ШК',
    color: 'bg-blue-600',
    desc: 'Создание закупок, сравнение КП, работа с ЕАТ и ЕИС',
  },
  {
    userId: 'u_che',
    name: 'Черемных Марина Юрьевна',
    role: 'Начальник отдела МТО',
    dept: 'Отдел МТО',
    avatar: 'ЧМ',
    color: 'bg-green-700',
    desc: 'Контроль закупок, согласование, подписание актов приёмки',
  },
  {
    userId: 'u_tol',
    name: 'Толоконников Юрий Васильевич',
    role: 'Заместитель руководителя',
    dept: 'Руководство',
    avatar: 'ТЮ',
    color: 'bg-purple-700',
    desc: 'Согласование СЗ, визирование и подписание договоров',
  },
  {
    userId: 'u_pik',
    name: 'Пикинер Ольга Владимировна',
    role: 'Начальник ФЭО',
    dept: 'Финансово-экономический отдел',
    avatar: 'ПО',
    color: 'bg-yellow-600',
    desc: 'Финансирование, экспертиза договоров, платежи',
  },
];

// ─── MOCK поставщики (для демо) ───────────────────────────────
export const MOCK_SUPPLIERS = [
  { id: 'sup1', name: 'ООО «ТехноОфис»', inn: '3664078901', rating: 4.8, status: 'reliable' as const, wonCount: 3, completedCount: 3, overdueCount: 0, totalSum: 523600, isSmallBusiness: true },
  { id: 'sup2', name: 'ООО «КанцМастер»', inn: '3666125843', rating: 4.2, status: 'reliable' as const, wonCount: 2, completedCount: 2, overdueCount: 0, totalSum: 312000, isSmallBusiness: true },
  { id: 'sup3', name: 'ООО «СитиКомп»', inn: '7743012345', rating: 3.5, status: 'neutral' as const, wonCount: 1, completedCount: 0, overdueCount: 0, totalSum: 4720000, isSmallBusiness: false },
  { id: 'sup4', name: 'ЗАО «КанцЛайф»', inn: '3661034782', rating: 2.8, status: 'unreliable' as const, wonCount: 3, completedCount: 2, overdueCount: 2, totalSum: 187000, isSmallBusiness: true },
  { id: 'sup5', name: 'ООО «МоскваСофт»', inn: '7725678901', rating: 4.5, status: 'reliable' as const, wonCount: 1, completedCount: 1, overdueCount: 0, totalSum: 378000, isSmallBusiness: false },
];

// Алиас для совместимости
export const MOCK_USERS = USERS;

// Алиас MOCK_DEPARTMENTS для совместимости
export const MOCK_DEPARTMENTS = INITIATING_DEPTS.map(d => ({
  id: d.id,
  name: d.name,
  shortName: d.short,
  head: d.head,
  color: d.color,
  employeeCount: USERS.filter(u => u.deptShort === d.short).length,
}));

// Текущий пользователь (Швецов К.Е. — для демонстрации)
export const CURRENT_USER = USERS.find(u => u.id === 'u_shv')!;
