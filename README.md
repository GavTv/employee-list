# Список сотрудников

Небольшое full-stack приложение: регистрация и вход, защищённый список сотрудников, поиск по ФИО и фильтр по отделу. Для локального запуска используется SQLite; опубликованный API подключается к Neon PostgreSQL, чтобы регистрации сохранялись в общей облачной базе. В профиле можно загрузить фото или создать сгенерированный аватар.

## Стек

- Frontend: React, TypeScript, Vite, FSD, обычный CSS, Tailwind CSS v4 для компонентов Kokonut UI, Anime.js.
- Backend: Node.js, Express, TypeScript.
- Хранение: SQLite (`better-sqlite3`) локально и Neon PostgreSQL при публикации. Пароли хешируются с помощью bcrypt, API защищено JWT.

## Структура клиента

- `pages/` содержит страницы входа и справочника. Они подключаются через `React.lazy`, поэтому Vite собирает отдельные чанки страниц.
- `entities/employee/api` и `entities/user/api`, а также `features/auth/api` содержат запросы по соответствующим доменам. HTTP-клиент с обработкой ошибок и токеном находится в `shared/api`.
- Стили страниц и компонентов оформлены CSS Modules рядом с TSX. Глобальный `app/styles.css` оставлен для сброса, токенов темы и общих элементов.
- `lib/utils.ts` экспортирует `cn` на основе `clsx` и `tailwind-merge` для условных классов.

## Структура сервера

Серверные файлы сгруппированы по функциям. Внутри каждой папки рядом лежат маршруты, контроллер, сервис и репозиторий:

```text
server/src/
├── features/
│   ├── auth/
│   │   ├── auth.routes.ts       # URL и middleware
│   │   ├── auth.controller.ts  # HTTP-запросы и ответы
│   │   ├── auth.service.ts     # правила регистрации и профиля
│   │   └── auth.repository.ts  # SQL-запросы пользователей
│   └── employees/
│       ├── employees.routes.ts
│       ├── employees.controller.ts
│       ├── employees.service.ts
│       └── employees.repository.ts
├── config/                     # переменные окружения
├── db/                         # адаптер SQLite / PostgreSQL и инициализация схемы
├── middleware/                 # JWT-аутентификация
├── shared/                     # общие типы HTTP
└── index.ts                    # запуск Express
```

Контроллеры отвечают за HTTP, сервисы — за проверки и правила, репозитории — за SQL. Так запросы к базе не смешиваются с обработкой маршрутов.

Интерфейс профиля использует компоненты [Kokonut UI](): Account Menu, Avatar Picker и File Upload. 



Для GitHub Pages используется домен `workers-names.ru`. Файл `CNAME` в корне репозитория фиксирует домен, а `client/public/CNAME` попадает в корень Vite-сборки.

## Локальный запуск

```bash
npm install
cp server/.env.example server/.env
npm run dev
```

Без `DATABASE_URL` сервер автоматически создаёт `server/data/employees.sqlite` и использует SQLite. Пароли хранятся только как bcrypt-хеши.

## Публикация API на Vercel и база Neon

1. Создайте проект Vercel из этого GitHub-репозитория и укажите **Root Directory: `server`**. Vercel обнаружит Express API в `src/index.ts`.
2. В Vercel → **Settings → Environment Variables** добавьте:
   - `DATABASE_URL` — pooled connection string из Neon (секрет, не добавлять в GitHub);
   - `JWT_SECRET` — случайная строка длиной не менее 32 символов;
   - `CLIENT_ORIGIN` — `https://workers-names.ru` (при необходимости перечислите несколько origin через запятую).
3. Разверните проект и скопируйте его публичный адрес, например `https://имя-проекта.vercel.app`.
4. В GitHub-репозитории откройте **Settings → Secrets and variables → Actions → Variables** и создайте переменную `VITE_API_BASE_URL` со значением адреса Vercel без завершающего `/`.
5. Повторно запустите workflow **Deploy GitHub Pages**. После публикации клиент будет отправлять API-запросы в Vercel.

Для локальной разработки `VITE_API_BASE_URL` оставьте пустым: Vite проксирует `/api` на локальный Express. В production Vercel использует Neon; SQLite файл из локального компьютера в облако не копируется.

### Просмотр записей в Beekeeper Studio

В Beekeeper выберите тип подключения **Postgres** и укажите параметры из Neon → **Connect** (host, database, user, password, port и SSL). Пользователи и сотрудники будут в таблицах `users` и `employees`. В `users.password_hash` лежит только хеш, исходный пароль в таблицу не записывается.

Секреты `DATABASE_URL` и `JWT_SECRET` храните только в локальном `server/.env` или в Environment Variables Vercel. Не коммитьте их в репозиторий.


## API

- `POST /api/auth/register` — регистрация по email и паролю.
- `POST /api/auth/login` — вход.
- `GET /api/employees` — поиск (`q`) и фильтр (`department`), требует `Authorization: Bearer <token>`.
- `POST /api/employees` — добавить сотрудника, требует авторизации.
- `GET /api/departments` — отделы для фильтра, требует авторизации.
- `GET /api/auth/me` и `PATCH /api/auth/profile` — сведения профиля и фото профиля, требуют авторизации.

