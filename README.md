# Список сотрудников

Небольшое full-stack приложение: регистрация и вход, защищённый список сотрудников, поиск по ФИО и фильтр по отделу. Для локального запуска используется SQLite; опубликованный API подключается к Neon PostgreSQL, чтобы регистрации сохранялись в общей облачной базе. В профиле можно загрузить фото или создать сгенерированный аватар.

## Стек

- Frontend: React, TypeScript, Vite, FSD, обычный CSS, Tailwind CSS v4 для компонентов Kokonut UI, Anime.js.
- Backend: Node.js, Express, TypeScript.
- Хранение: SQLite (`better-sqlite3`) локально и Neon PostgreSQL при публикации. Пароли хешируются с помощью bcrypt, API защищено JWT.

## Структура клиента

- `pages/` содержит страницы входа и справочника. 
- `entities/employee/api` и `entities/user/api`, а также `features/auth/api` содержат запросы по соответствующим доменам. HTTP-клиент с обработкой ошибок и токеном находится в `shared/api`.
- Стили страниц и компонентов оформлены CSS Modules рядом с TSX. Глобальный `app/styles.css` оставлен для сброса, токенов темы и общих элементов.
- `lib/utils.ts` экспортирует `cn` на основе `clsx` и `tailwind-merge` для условных классов.

```

Контроллеры отвечают за HTTP, сервисы — за проверки и правила, репозитории — за SQL. Так запросы к базе не смешиваются с обработкой маршрутов.

Интерфейс профиля использует компоненты [Kokonut UI](): Account Menu, Avatar Picker и File Upload. 



Для GitHub Pages используется домен `workers-names.ru`. Файл `CNAME` в корне репозитория фиксирует домен, а `client/public/CNAME` попадает в корень Vite-сборки.





Для локальной разработки `VITE_API_BASE_URL` оставьте пустым: Vite проксирует `/api` на локальный Express. В production Vercel использует Neon; SQLite файл из локального компьютера в облако не копируется.

### Просмотр записей в Beekeeper Studio

В Beekeeper выберите тип подключения **Postgres** и укажите параметры из Neon → **Connect** (host, database, user, password, port и SSL). 


## API

- `POST /api/auth/register` — регистрация по email и паролю.
- `POST /api/auth/login` — вход.
- `GET /api/employees` — поиск (`q`) и фильтр (`department`), требует `Authorization: Bearer <token>`.
- `POST /api/employees` — добавить сотрудника, требует авторизации.
- `GET /api/departments` — отделы для фильтра, требует авторизации.
- `GET /api/auth/me` и `PATCH /api/auth/profile` — сведения профиля и фото профиля, требуют авторизации.

