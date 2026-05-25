'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, X, ChevronRight, ChevronLeft, CheckCircle, BookOpen, Zap } from 'lucide-react';
import { useAppStore } from '@/store/index';
import type { ProcurementStatus } from '@/types';

/* ─────────────────────────────────────────────
   ТИП ШАГА
───────────────────────────────────────────── */
interface Step {
  route: string;
  tab?: string;          // вкладка карточки которую нужно открыть
  block: string;         // название блока (для оглавления)
  blockNum: number;      // номер блока
  title: string;
  role: string;          // кто выполняет
  what: string;          // что происходит на экране
  why: string;           // зачем это нужно
  action?: string;       // действие системы (подсветить)
  highlight?: string;    // что показать комиссии
  newStatus?: ProcurementStatus;
  duration: number;
}

/* ─────────────────────────────────────────────
   25 ШАГОВ — ПОЛНЫЙ ЦИКЛ ЗАКУПКИ
───────────────────────────────────────────── */
const STEPS: Step[] = [
  // ── БЛОК 1: ИНИЦИАЦИЯ ──────────────────────
  {
    route: '/dashboard',
    block: '📋 Инициация', blockNum: 1,
    title: 'Рабочий стол — начало рабочего дня',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Специалист МТО открывает систему. На рабочем столе: 1 просрочка (красная), 3 срочные задачи, новое уведомление — служебная записка от ИТ-отдела на закупку картриджей.',
    why: 'Dashboard — центр управления. Специалист сразу видит что требует внимания сегодня, не тратя время на поиск по таблицам Excel.',
    highlight: 'Красные плитки = требуют действия сегодня',
    duration: 7000,
  },
  {
    route: '/uvedomleniya',
    block: '📋 Инициация', blockNum: 1,
    title: 'Уведомления — СЗ от ИТ-отдела',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Система автоматически создала уведомление: «Никитин П.А. направил служебную записку на согласование услуг и закупку картриджей». Специалист читает и отмечает прочитанным.',
    why: 'Автоматические уведомления исключают ситуацию когда СЗ «потерялась» в почте или на столе. Система сама сообщает кому и что нужно сделать.',
    highlight: 'Кнопка «Прочитать все» — счётчик в шапке обнулится',
    duration: 6000,
  },
  {
    route: '/sluzhebnye-zapiski',
    block: '📋 Инициация', blockNum: 1,
    title: 'Служебная записка — регистрация запроса',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Открываем СЗ-МТО-2026-078: Никитин П.А. (ИТ-отдел) запрашивает 28 картриджей HP и 20 Canon для принтеров на II квартал 2026 г. Запрашиваемая сумма 162 000 руб. Адресат — Смирнова Н.С.',
    why: 'Электронная регистрация СЗ — первый этап по 44-ФЗ. Системе видно: кто запросил, что, на какую сумму, когда. Бумажные СЗ больше не теряются.',
    highlight: 'Кликните на СЗ-МТО-2026-078 чтобы открыть детали',
    duration: 7000,
  },

  // ── БЛОК 2: ПОДГОТОВКА ─────────────────────
  {
    route: '/soglasovaniya',
    block: '📝 Подготовка', blockNum: 2,
    title: 'Согласование СЗ с Заместителем руководителя',
    role: 'Фёдоров С.В. · Заместитель руководителя',
    what: 'СЗ передана Фёдорову С.В. на согласование. Он проверяет обоснование потребности, проверяет наличие лимитов бюджетных обязательств. Нажимает «Согласовать» — статус меняется на «Согласована».',
    why: 'Цифровое согласование vs бумажный обход кабинетов: вместо 2-3 дней хождения с бумагой — 15 минут. История согласований хранится в системе.',
    highlight: 'Нажмите «Согласовать» — появится в истории с датой',
    duration: 7000,
  },
  {
    route: '/zakupki/novaya',
    block: '📝 Подготовка', blockNum: 2,
    title: 'Создание закупки — выбор процедуры',
    role: 'Петров А.В. · Специалист МТО',
    what: 'СЗ согласована — создаём закупку. Выбираем процедуру «ЕАТ Берёзка» (до 600 тыс. руб., п.4 ч.1 ст.93 44-ФЗ). Система автоматически формирует правильный 14-этапный workflow и показывает список обязательных документов.',
    why: 'Выбор процедуры определяет весь дальнейший маршрут. Система не даст разместить аукцион там где нужна котировка — это защита от ошибок.',
    highlight: 'При выборе карточки «ЕАТ Берёзка» — список документов справа меняется',
    duration: 7000,
  },
  {
    route: '/zakupki/novaya',
    block: '📝 Подготовка', blockNum: 2,
    title: 'Создание закупки — заполнение формы',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Вводим: «Поставка картриджей для принтеров и МФУ (II кв. 2026)». 4 позиции — HP, Canon, Samsung, Epson. НМЦК считается автоматически: 162 000 руб. Затем заполняем условия поставки: срок 30 дней, приёмка 5 р.д., адрес — склад МТО. Это обязательные условия договора по 44-ФЗ.',
    why: 'Условия поставки и приёмки — ключевые параметры договора. Система автоматически добавит дедлайн в «Контроль сроков» и напомнит о приёмке за 3 дня до истечения срока.',
    highlight: 'Блок «🚚 Условия поставки» — срок, адрес и порядок поставки по 44-ФЗ',
    duration: 7000,
  },

  // ── БЛОК 3: РАЗМЕЩЕНИЕ ─────────────────────
  {
    route: '/zakupki',
    block: '🏛 Размещение', blockNum: 3,
    title: 'Реестр — закупка появилась',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Закупка РЗ-2026-00142 появилась в реестре со статусом «СЗ в МТО». Реестр обновился автоматически — счётчик «Активных» увеличился, сумма в итогах пересчиталась.',
    why: 'Единый реестр — единая точка истины. Начальник МТО, бухгалтерия и руководство видят закупку сразу после создания, без пересылки таблиц.',
    highlight: 'Фильтр «Статусы → СЗ в МТО» покажет только новые закупки',
    duration: 6000,
  },
  {
    route: '/zakupki/p001',
    block: '🏛 Размещение', blockNum: 3,
    title: 'Карточка — вкладка «Этапы» — workflow',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Открываем карточку закупки. Вкладка «Этапы» показывает 14 шагов: текущий — «СЗ в МТО» (подсвечен синим). Нажимаем зелёную кнопку «→ Согласование СЗ» — статус меняется, в истории появляется запись.',
    why: 'Пошаговый workflow не даёт пропустить обязательный этап. Каждый переход фиксируется — это аудиторский след для проверяющих органов.',
    highlight: 'Зелёная кнопка вверху карточки — главное действие текущего этапа',
    newStatus: 'sz_approval',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '🏛 Размещение', blockNum: 3,
    title: 'Переход через этапы — финансирование и подготовка',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Последовательно проходим этапы: Согласование СЗ → Финансирование (ФЭО перекладывает ЛБО на КБК 244) → Подготовка (запрашиваем 3 КП, готовим ТЗ и проект договора).',
    why: 'Каждый этап — реальное действие из регламента 44-ФЗ. Система напоминает что нужно сделать и не даёт перескочить через обязательный шаг.',
    highlight: 'На вкладке «Этапы» видны все документы которые нужны на текущем шаге',
    newStatus: 'preparation',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '🏛 Размещение', blockNum: 3,
    title: 'Размещение котировочной сессии в ЕАТ',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Документы готовы. Переводим закупку на статус «Размещение в ЕАТ/ЕИС». Система фиксирует дату размещения. Котировочная сессия открыта на ЕАТ «Берёзка» — поставщики видят запрос и начинают подавать ценовые предложения.',
    why: 'Интеграция с ЕАТ «Берёзка»: вся информация о размещении хранится в карточке закупки. Не нужно переключаться между системами чтобы проверить статус.',
    highlight: 'Статус изменился — в реестре и на дашборде обновился счётчик',
    newStatus: 'placement',
    duration: 7000,
  },

  // ── БЛОК 4: ТОРГИ ──────────────────────────
  {
    route: '/zakupki/p001',
    block: '⚡ Торги', blockNum: 4,
    title: 'Торги — поступили ценовые предложения',
    role: 'ЕАТ «Берёзка» · Автоматически',
    what: 'Котировочная сессия завершилась. Поступило 3 ценовых предложения: ООО «ТехноОфис» — 156 400 руб., ООО «КанцМастер» — 159 800 руб., ИП Соколов — 161 500 руб. Система определила победителя — наименьшая цена.',
    why: 'Конкурентная процедура через ЕАТ обеспечивает прозрачность выбора поставщика. Экономия 5 600 руб. (3,5% от НМЦК) фиксируется автоматически.',
    highlight: 'Экономия бюджета видна прямо в карточке закупки',
    newStatus: 'bidding',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '⚡ Торги', blockNum: 4,
    title: 'Победитель определён — ООО «ТехноОфис»',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Переводим закупку на «Согласование победителя». В карточке появляются реквизиты победителя: ООО «ТехноОфис», ИНН 7701234567, предложенная цена 156 400 руб. Проверяем победителя в реестре НДП — чисто.',
    why: 'Система хранит все ценовые предложения и обоснование выбора победителя. При проверке контрольными органами — вся документация в одном месте.',
    highlight: 'Вкладка «Поставщик» — реквизиты победителя и история работы с ним',
    newStatus: 'winner_approval',
    duration: 7000,
  },

  // ── БЛОК 5: СОГЛАСОВАНИЕ ДОГОВОРА ──────────
  {
    route: '/soglasovaniya',
    block: '📄 Договор', blockNum: 5,
    title: 'Согласование победителя с начальником МТО',
    role: 'Смирнова Н.С. · Начальник МТО',
    what: 'Смирнова Н.С. проверяет: соответствие победителя требованиям ТЗ, отсутствие в РНП, обоснованность цены. Согласует победителя — закупка переходит к экспертизе договора.',
    why: 'Обязательная виза начальника МТО — требование внутреннего регламента. Электронное согласование: фиксируется дата, время, IP-адрес.',
    highlight: 'Цепочка согласования — все визы в одном месте, не нужно искать бумажный квиток',
    duration: 6000,
  },
  {
    route: '/zakupki/p001',
    block: '📄 Договор', blockNum: 5,
    title: 'Карточка — вкладка «Документы» — загрузка договора',
    role: 'Козлов Д.М. · Контрактный управляющий',
    what: 'Открываем вкладку «Документы». Здесь уже загружены: СЗ, ТЗ, 3 КП, обоснование НМЦК. Козлов Д.М. загружает проект договора. Кнопка «Загрузить» → выбор файла → файл появляется в таблице с датой и автором.',
    why: 'Централизованное хранение документов: все участники процесса видят актуальную версию договора, история версий сохраняется. Конец эпохи «договор в почте».',
    highlight: 'Нажмите «Загрузить» — файл появится в таблице документов',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '📄 Договор', blockNum: 5,
    title: 'Экспертиза договора — ФЭО и правовой отдел',
    role: 'Волкова Е.И. · ФЭО / Правовой отдел',
    what: 'Договор передан в ФЭО (финансовая виза) и правовой отдел (правовая виза). Статус «Экспертиза договора». Каждый отдел проверяет свою часть и ставит визу. Квиток со всеми визами собран.',
    why: 'Параллельная экспертиза вместо последовательной сокращает срок согласования с 5 до 2 дней. Все визы фиксируются в системе — квиток не нужно носить руками.',
    highlight: 'Вкладка «Согласования» показывает статус каждой визы в реальном времени',
    newStatus: 'contract_expertise',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '📄 Договор', blockNum: 5,
    title: 'Визирование Заместителя руководителя',
    role: 'Фёдоров С.В. · Заместитель руководителя',
    what: 'Договор с квитком (визы ФЭО + правового) передан Фёдорову С.В. Он видит в своей панели руководителя что договор ждёт визирования. Просматривает ключевые параметры и визирует. Договор готов к подписанию.',
    why: 'Руководителю не нужно ждать пока принесут бумаги. Система сама уведомляет когда нужна его виза. Среднее время визирования сократилось с 3 дней до 4 часов.',
    highlight: 'Панель руководителя — раздел «Требуют решения» показывает все ожидающие договора',
    newStatus: 'deputy_signing',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '📄 Договор', blockNum: 5,
    title: 'Подписание ЭЦП — договор заключён',
    role: 'Петров А.В. · МТО + Руководитель',
    what: 'Все визы получены. Договор распечатывается, подписывается ЭЦП. Система переводит закупку на «Договор подписан (ЭЦП)». Автоматически создаётся запись в реестре ЕАТ «Берёзка». Поставщику направляется уведомление.',
    why: 'Подписание ЭЦП имеет юридическую силу. Запись в реестре ЕАТ — обязательное требование. Система делает всё автоматически после нажатия кнопки.',
    highlight: 'После подписания — в карточке появляется дата договора и реквизиты',
    newStatus: 'contract_signed',
    duration: 7000,
  },

  // ── БЛОК 6: ИСПОЛНЕНИЕ ─────────────────────
  {
    route: '/zakupki/p001',
    block: '🚚 Исполнение', blockNum: 6,
    title: 'Исполнение — ожидаем поставку',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Закупка в статусе «Исполнение». ООО «ТехноОфис» начал поставку. Срок по договору — 30.06.2026. Система автоматически контролирует срок и предупредит за 5 дней если поставка не подтверждена.',
    why: 'Контроль сроков исполнения — одна из главных функций МТО. Раньше специалист держал в голове или в таблице. Теперь система сама напоминает.',
    newStatus: 'execution',
    highlight: 'Раздел «Контроль сроков» покажет эту закупку в жёлтой или оранжевой зоне',
    duration: 6000,
  },
  {
    route: '/ispolnenie',
    block: '🚚 Исполнение', blockNum: 6,
    title: 'Реестр исполнений — прогресс и сроки поставки',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Открываем «Исполнение договоров». Карточка РЗ-2026-00142/Д: поставлено 12 из 28 HP, 20/20 Canon. Прогресс 45%. В детальной панели справа — блок «🚚 Условия поставки»: срок 30.06.2026, приёмка 5 р.д., адрес склада МТО. Всё заполнено при создании закупки.',
    why: 'Комиссия по приёмке видит: что должны поставить, что уже поставлено, куда и в какие сроки. Не нужно искать договор — всё в карточке.',
    highlight: 'Нажмите на карточку — справа появится блок с условиями поставки',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '🚚 Исполнение', blockNum: 6,
    title: 'Карточка — вкладка «Комментарии»',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Специалист пишет внутренний комментарий: «Первая партия 12 картриджей HP получена 15.05.2026. Акт приёмки подписан. Остаток 16 шт. ожидается до 25.05.2026. Счёт получен, передан в бухгалтерию». Комментарий сохраняется в store.',
    why: 'Внутренние комментарии — живая история работы по закупке. При смене специалиста новый сотрудник видит весь контекст. Не нужно звонить предшественнику.',
    highlight: 'Вкладка «Комментарии» — пишите что угодно, всё сохраняется',
    duration: 7000,
  },

  // ── БЛОК 7: ОПЛАТА И ЗАКРЫТИЕ ──────────────
  {
    route: '/platezhi',
    block: '💰 Оплата', blockNum: 7,
    title: 'Платежи — оформление платёжного поручения',
    role: 'Волкова Е.И. · Главный бухгалтер',
    what: 'Получены документы: счёт №ТО-2026-0147 на 156 400 руб., накладная, акт выполненных работ. Волкова Е.И. видит задачу в своём разделе. Оформляет платёжное поручение через ФЭО. Статус закупки — «Оплата».',
    why: 'Связка MTO → бухгалтерия работает через систему: документы не теряются, статус виден всем участникам, бухгалтер не тратит время на выяснение деталей.',
    newStatus: 'payment_docs',
    highlight: 'Раздел «Платежи» показывает все ожидающие оплаты закупки',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '💰 Оплата', blockNum: 7,
    title: 'Карточка — вкладка «Финансы»',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Открываем вкладку «Финансы»: НМЦК 162 000 руб., сумма договора 156 400 руб. (экономия 5 600 руб. = 3,5%), оплачено 156 400 руб. (100%). Прогресс-бар освоения бюджета заполнен. Договор исполнен и оплачен.',
    why: 'Финансовый контроль в разрезе каждой закупки: плановая vs фактическая стоимость, экономия, остаток. Бухгалтерия и руководство видят реальную картину.',
    highlight: 'Прогресс-бар 100% зелёного цвета — закупка оплачена полностью',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '💰 Оплата', blockNum: 7,
    title: 'Отчётность в ЕИС — обязательное требование',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Переводим на «Отчётность в ЕИС». По 44-ФЗ обязательно разместить отчёт об исполнении договора в ЕАТ «Берёзка» в течение 5 рабочих дней после оплаты. Система напомнит если срок пропущен — это риск штрафа по КоАП.',
    why: 'Контроль обязательной отчётности — один из ключевых рисков для МТО. Система автоматически создаёт задачу и уведомление за 2 дня до истечения срока.',
    newStatus: 'eis_reporting',
    highlight: 'Уведомление об обязательной отчётности появится в колоколе',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '💰 Оплата', blockNum: 7,
    title: 'Вкладка «История» — полный аудиторский след',
    role: 'Комиссия · Проверяющий орган',
    what: 'Вкладка «История» показывает полный лог закупки: кто создал, кто согласовал СЗ, кто завизировал договор, кто подписал ЭЦП, когда оплатили — каждое действие с датой, временем и IP-адресом. 14 записей за 2 месяца работы.',
    why: 'Аудиторский след — требование 44-ФЗ и внутренних регламентов. При проверке КСП, прокуратуры или Росфиннадзора — вся история в системе, ничего не нужно искать.',
    highlight: 'История неизменна — никто не может удалить или исправить запись',
    duration: 7000,
  },
  {
    route: '/zakupki/p001',
    block: '🗄 Архив', blockNum: 8,
    title: 'Архивирование — закупка завершена',
    role: 'Петров А.В. · Специалист МТО',
    what: 'Все этапы пройдены. Закупка переводится в «Архив». Документы хранятся в системе 5 лет согласно требованиям. В реестре закупка помечена как завершённая. Счётчики на дашборде обновились.',
    why: 'Электронный архив vs бумажные папки: мгновенный поиск по номеру, названию, поставщику. Через 3 года найти договор — секунды, не часы.',
    newStatus: 'archive',
    highlight: 'Реестр → фильтр «Архив» — все завершённые закупки с полной историей',
    duration: 7000,
  },

  // ── БЛОК 8: АНАЛИТИКА И ИТОГ ───────────────
  {
    route: '/postavshchiki',
    block: '📊 Аналитика', blockNum: 8,
    title: '🏢 Поставщики — рейтинг добросовестности',
    role: 'Смирнова Н.С. · Начальник МТО',
    what: 'Реестр поставщиков формируется автоматически из победителей торгов. Каждый поставщик получает статус: «✅ Добросовестный» (нет просрочек, все контракты выполнены), «⚠ Риск просрочек» (2+ просрочки), «Новый» (первый контракт). Рейтинг 1-5 с прозрачной формулой.',
    why: 'Перед выбором победителя специалист проверяет историю поставщика прямо в системе, не выходя в внешние реестры. Видно: сколько контрактов, экономия, нарушения.',
    highlight: 'Нажмите на поставщика — справа видна формула расчёта рейтинга построчно',
    duration: 6000,
  },
  {
    route: '/analitika',
    block: '📊 Аналитика', blockNum: 8,
    title: 'Аналитика — эффект закупки виден в графиках',
    role: 'Смирнова Н.С. · Начальник МТО',
    what: 'Открываем аналитику. Закупка картриджей учтена в динамике мая: общая экономия выросла. Круговая диаграмма обновилась — одна закупка перешла из «Исполнение» в «Архив». Все данные из актуального реестра в реальном времени.',
    why: 'Аналитика без ручного сбора: раньше отчёт руководству занимал полдня. Теперь — открыл страницу, всё посчитано автоматически из реестра.',
    highlight: 'Все графики обновляются при каждом изменении данных в реестре',
    duration: 7000,
  },
  {
    route: '/rukovoditel',
    block: '📊 Аналитика', blockNum: 8,
    title: 'Панель руководителя — итоговый вид',
    role: 'Фёдоров С.В. · Заместитель руководителя',
    what: 'Фёдоров С.В. открывает свою панель: нагрузка специалистов, закупки требующие решения, KPI отдела за период. Всё в одном экране — не нужно запрашивать отчёты у Смирновой Н.С.',
    why: 'Руководитель видит объективную картину, а не интерпретацию подчинённых. Время принятия управленческих решений по закупкам сократилось с дней до минут.',
    highlight: 'Нагрузка по специалистам — кто перегружен, кто недогружен',
    duration: 7000,
  },
  {
    route: '/about',
    block: '📊 Аналитика', blockNum: 8,
    title: 'Итог: экономический эффект ЕПП',
    role: 'Для приёмочной комиссии',
    what: 'Полный цикл: СЗ → согласование → создание закупки (с условиями поставки и приёмки) → ЕАТ Берёзка → победитель → договор → исполнение (контроль поставки по позициям) → оплата → ЕИС → архив. 14 этапов, 5 сотрудников, автоматический контроль сроков на каждом шаге.',
    why: '~3 часа экономии в день на специалиста · Сокращение ошибок на 80% · Поиск документов в 180× быстрее · Полный аудиторский след · Соответствие 44-ФЗ автоматически.',
    highlight: 'ЕПП — не демо-прототип, а реально внедряемая система для МТО Росреестра',
    duration: 8000,
  },
];

const SESS_STEP    = 'epp_demo_step';
const SESS_PLAYING = 'epp_demo_playing';

const BLOCKS = Array.from(new Set(STEPS.map(s => s.block)));

/* ─────────────────────────────────────────────
   КОМПОНЕНТ
───────────────────────────────────────────── */
export function DemoRunner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { changeStatus } = useAppStore();

  const [step, setStep] = useState(() =>
    typeof window !== 'undefined' ? Number(sessionStorage.getItem(SESS_STEP) ?? 0) : 0
  );
  const [playing, setPlaying] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(SESS_PLAYING) === 'true' : false
  );
  const [done, setDone]       = useState(false);
  const [showToc, setShowToc] = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef               = useRef(step);
  stepRef.current = step;

  const cur    = STEPS[step] ?? STEPS[0];
  const isLast = step === STEPS.length - 1;
  const pct    = Math.round(((step + 1) / STEPS.length) * 100);

  useEffect(() => {
    sessionStorage.setItem(SESS_STEP, String(step));
    sessionStorage.setItem('epp_demo_open', 'true'); // держим панель открытой
  }, [step]);
  useEffect(() => { sessionStorage.setItem(SESS_PLAYING, String(playing)); }, [playing]);

  const navigate = useCallback((route: string) => { router.push(route); }, [router]);

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

  useEffect(() => {
    if (!playing || done) return;
    timerRef.current = setTimeout(goNext, cur.duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, done, step, goNext, cur.duration]);

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
      {/* ── TOC drawer ── */}
      {showToc && (
        <div className="fixed inset-0 z-[9985]" onClick={() => setShowToc(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div>
                <div className="text-xs font-bold text-gray-800">Содержание демонстрации</div>
                <div className="text-xs text-gray-500">{STEPS.length} шагов · {BLOCKS.length} блоков</div>
              </div>
              <button onClick={() => setShowToc(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={14}/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {BLOCKS.map(block => {
                const blockSteps = STEPS.filter(s => s.block === block);
                const firstIdx   = STEPS.findIndex(s => s.block === block);
                const isCurrentBlock = cur.block === block;
                return (
                  <div key={block} className="mb-1">
                    <div className={`text-xs font-bold px-2 py-1.5 rounded mb-0.5 ${isCurrentBlock ? 'text-blue-700 bg-blue-50' : 'text-gray-500'}`}>
                      {block}
                    </div>
                    {blockSteps.map((s, i) => {
                      const idx = firstIdx + i;
                      return (
                        <button key={idx} onClick={() => goTo(idx)}
                          className={`w-full flex items-start gap-2 px-3 py-1.5 rounded text-left mb-0.5 transition-colors ${
                            idx === step ? 'bg-blue-600 text-white' :
                            idx < step   ? 'text-green-700 hover:bg-green-50' :
                                           'text-gray-600 hover:bg-gray-50'
                          }`}>
                          <span className={`text-xs flex-shrink-0 mt-0.5 font-mono ${idx === step ? 'text-white' : idx < step ? 'text-green-500' : 'text-gray-400'}`}>
                            {idx < step ? '✓' : String(idx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs leading-snug">{s.title}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Панель снизу ── */}
      <div className="fixed inset-x-0 bottom-0 z-[9990]">
        {/* Прогресс */}
        <div className="h-1 bg-gray-200">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
            style={{ width: `${pct}%` }} />
        </div>

        <div className="bg-white border-t-2 border-blue-700" style={{ boxShadow: '0 -4px 20px rgba(0,48,135,0.12)' }}>
          <div className="max-w-6xl mx-auto">
            {done ? (
              <div className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="text-sm font-bold text-gray-800">Полный цикл закупки завершён!</div>
                    <div className="text-xs text-gray-500">25 шагов · от служебной записки до архива · 5 сотрудников · 14 этапов по 44-ФЗ</div>
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
              <div className="px-4 py-2.5 flex items-start gap-4">

                {/* Левая часть — контент */}
                <div className="flex-1 min-w-0">
                  {/* Мета */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-white bg-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      {step + 1} / {STEPS.length}
                    </span>
                    <span className="text-xs text-blue-600 font-bold flex-shrink-0">{cur.block}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">·</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">👤 {cur.role}</span>
                    {playing && <span className="text-xs text-orange-500 animate-pulse ml-auto flex-shrink-0">⏱ авто</span>}
                  </div>

                  {/* Заголовок */}
                  <div className="text-sm font-bold text-gray-900 mb-1 leading-tight">{cur.title}</div>

                  {/* Что/Зачем */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                    <div className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-700">Что: </span>{cur.what}
                    </div>
                    <div className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-semibold">Зачем: </span>{cur.why}
                    </div>
                  </div>

                  {/* Подсказка */}
                  {cur.highlight && (
                    <div className="mt-1 text-xs text-amber-700 flex items-center gap-1">
                      <Zap size={10} className="flex-shrink-0"/>
                      <span>{cur.highlight}</span>
                    </div>
                  )}
                </div>

                {/* Правая часть — управление */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <button onClick={goPrev} disabled={step === 0}
                      className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-25 rounded hover:bg-gray-100 transition-colors">
                      <ChevronLeft size={16}/>
                    </button>

                    <button onClick={() => setPlaying(p => !p)}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        playing ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}>
                      {playing ? <><Pause size={12}/> Пауза</> : <><Play size={12}/> Авто</>}
                    </button>

                    <button onClick={goNext}
                      className="flex items-center gap-1.5 px-5 py-1.5 text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-sm">
                      {isLast ? <><CheckCircle size={13}/> Готово</> : <>Далее <ChevronRight size={13}/></>}
                    </button>

                    <button onClick={() => setShowToc(t => !t)}
                      className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${showToc ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'}`}
                      title="Содержание">
                      <BookOpen size={15}/>
                    </button>

                    <button onClick={handleClose}
                      className="p-1.5 text-gray-300 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>

                  {/* Прогресс-точки */}
                  <div className="flex gap-0.5 flex-wrap justify-end max-w-48">
                    {STEPS.map((_, i) => (
                      <button key={i} onClick={() => goTo(i)}
                        className={`rounded-full transition-all duration-200 ${
                          i === step ? 'w-4 h-1.5 bg-blue-700' :
                          i < step   ? 'w-1.5 h-1.5 bg-green-400' :
                                       'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Кнопка запуска ── */
export function DemoButton({ variant = 'ghost' }: { variant?: 'primary'|'ghost'|'floating' }) {
  const start = () => window.dispatchEvent(new Event('epp:demo:run'));

  if (variant === 'floating') {
    return (
      <button onClick={start}
        className="fixed bottom-6 right-6 z-[9960] flex items-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-full shadow-xl hover:bg-blue-800 transition-all hover:scale-105 active:scale-95"
        title="Запустить полный демо-тур: от служебной записки до архива (25 шагов)">
        <Play size={14}/>
        <span className="text-sm font-bold">▶ Демо</span>
      </button>
    );
  }

  return (
    <button onClick={start}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${
        variant === 'primary'
          ? 'bg-blue-700 text-white hover:bg-blue-800'
          : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
      }`}>
      <Play size={11}/> Демо
    </button>
  );
}
