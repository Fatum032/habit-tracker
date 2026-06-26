# Духовный трекер

Веб-приложение для ежедневных привычек, духовного анализа, планов на день и календаря мероприятий.

## Стек

- React + TypeScript + Vite + Tailwind
- Supabase (Auth, PostgreSQL, RLS)
- Vercel

## Локальный запуск

```bash
npm install
cp .env.example .env
# заполни VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
npm run dev
```

## Деплой

Переменные окружения на Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
