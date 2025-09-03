# HayalKız WebApp

React приложение для HayalKız Mini App.

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

## Сборка для продакшена

```bash
npm run build
```

## Деплой на Netlify

Это приложение настроено для автоматического деплоя на Netlify. При пуше в основную ветку GitHub, Netlify автоматически соберет и развернет приложение.

### Настройка Netlify:

1. Подключите ваш GitHub репозиторий к Netlify
2. Укажите следующие настройки:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

Файл `netlify.toml` уже настроен для автоматической конфигурации.
