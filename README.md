# Портал закупок Росреестра — ЕИС · ЕАТ «Берёзка»

**Версия 3.0 · Next.js 14 · TypeScript · Tailwind CSS**

---

## 🚀 Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) → перенаправление на `/login` → нажмите **«Войти в систему»**.

---

## ☁️ Деплой на Vercel (GitHub)

### Шаг 1 — Загрузить на GitHub

```bash
# Разархивируйте ZIP и перейдите в папку
cd rosreestr-zakupki

# Инициализируйте git и загрузите
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/rosreestr-zakupki.git
git push -u origin main
```

### Шаг 2 — Подключить к Vercel

1. Зайдите на [vercel.com](https://vercel.com) → **Add New Project**
2. Выберите репозиторий `rosreestr-zakupki`
3. ⚠️ **ВАЖНО:** В разделе **"Configure Project"** убедитесь:
   - **Framework Preset:** `Next.js` (выбирается автоматически)
   - **Root Directory:** оставьте **пустым** (или `.`)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (по умолчанию)
   - **Install Command:** `npm install`
4. Нажмите **Deploy**

### Деплой через Vercel CLI

```bash
npm install -g vercel
cd rosreestr-zakupki
vercel --prod
```

---

## 📁 Структура

```
rosreestr-zakupki/
├── app/                  # Next.js App Router (36 маршрутов)
│   ├── dashboard/        # Рабочий стол
│   ├── zakupki/          # Реестр закупок + карточка + создание + архив
│   ├── kontrakty/        # Договоры
│   ├── postavshchiki/    # Поставщики
│   ├── dokumenty/        # Документы
│   ├── platezhi/         # Платежи
│   ├── ispolnenie/       # Исполнение
│   ├── kalendar/         # Календарь
│   ├── kontrol-srokov/   # Контроль сроков
│   ├── soglasovaniya/    # Согласования
│   ├── zadachi/          # Задачи
│   ├── riski/            # Риски
│   ├── monitoring/       # Мониторинг просрочек
│   ├── analitika/        # Аналитика
│   ├── otchetnost/       # Отчётность
│   ├── kpi/              # Центр KPI
│   ├── rukovoditel/      # Панель руководителя
│   ├── zhurnal/          # Журнал действий
│   ├── istoriya/         # История изменений
│   ├── proverki/         # Проверки
│   ├── poisk/            # Поиск
│   ├── polzovateli/      # Пользователи
│   ├── roli/             # Роли и права
│   ├── podrazdeleniya/   # Подразделения
│   ├── spravochniki/     # Справочники
│   ├── integracii/       # Интеграции
│   ├── shablony/         # Шаблоны
│   ├── sluzhebnye-zapiski/ # Служебные записки
│   ├── chat/             # Внутренний чат
│   ├── nastroyky/        # Настройки
│   ├── profil/           # Профиль
│   ├── support/          # Поддержка
│   └── login/            # Авторизация
├── components/
│   ├── layout/           # AppLayout, Sidebar, Header
│   └── ui/               # Переиспользуемые компоненты
├── mock/data/            # Mock данные (2026)
├── lib/utils.ts          # Утилиты
├── types/index.ts        # TypeScript типы
├── vercel.json           # Конфиг Vercel
└── package.json
```

---

## ⚙️ Технологии

| Пакет | Версия |
|---|---|
| Next.js | 14.2.5 |
| React | 18.3 |
| TypeScript | 5.4 |
| Tailwind CSS | 3.4 |
| Recharts | 2.12 |
| Lucide React | 0.396 |
| Zustand | 4.5 |

---

## 🎭 Демо-роли

| Логин | Роль |
|---|---|
| petrov.av | Специалист МТО |
| smirnova.ns | Начальник отдела |
| kozlov.dm | Контрактный управляющий |
| volkova.ei | Бухгалтерия |
| fedorov.sv | Руководство |

---

> ⚠️ Демонстрационный прототип. Все данные вымышлены.
