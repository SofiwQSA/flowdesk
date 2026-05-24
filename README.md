# ⚡ FlowDesk — Инструкция запуска

## Шаг 1 — Установи Node.js
Скачай с https://nodejs.org (кнопка LTS) и установи как обычную программу.

## Шаг 2 — Установи PostgreSQL
Скачай с https://postgresql.org/download/windows
При установке придумай пароль и запомни его — он понадобится.
Stack Builder в конце установки можно закрыть (Cancel).

## Шаг 3 — Распакуй архив
Распакуй flowdesk-secure.zip в любую папку, например C:\flowdesk

## Шаг 4 — Открой терминал в папке проекта
Зайди в папку flowdesk в проводнике → зажми Shift → правая кнопка мыши → "Открыть окно PowerShell здесь"

## Шаг 5 — Установи зависимости
```
npm install
```

## Шаг 6 — Создай файл настроек
```
copy .env.example .env
```

## Шаг 7 — Открой .env и вставь пароль от PostgreSQL
```
notepad .env
```
Найди строку:
```
DATABASE_URL="postgresql://user:password@host:5432/flowdesk"
```
Замени на:
```
DATABASE_URL="postgresql://postgres:ТУТ_ТВОЙ_ПАРОЛЬ@localhost:5432/flowdesk"
```
Сохрани файл (Ctrl+S).

## Шаг 8 — Сгенерируй секретный ключ
```
npm run generate-secret
```

## Шаг 9 — Создай базу данных
```
npx prisma migrate dev --name init
```

## Шаг 10 — Создай админа
```
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
```

## Шаг 11 — Запусти сервер
```
npm run dev
```

## Шаг 12 — Открой браузер
http://localhost:3000

---

## Вход в систему

### Админ аккаунт (уже создан):
- Email: admin@flowdesk.com
- Пароль: admin123

### Или зарегистрируй новый аккаунт через сайт

---

## Бэкап базы данных
```
npm run backup
```
Файл сохранится в папку backups/

---

## Если что-то не работает

**Ошибка подключения к базе** → проверь пароль в .env

**Команда не найдена** → убедись что Node.js установлен: node --version

**Порт занят** → убедись что не запущен другой npm run dev
