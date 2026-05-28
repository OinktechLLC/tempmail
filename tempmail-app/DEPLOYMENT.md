# 🚀 Инструкция по развёртыванию TempMail

## ✅ Статус сборки

Приложение успешно собрано и готово к продакшену!

```
✓ 31 modules transformed.
dist/index.html                   0.64 kB │ gzip:  0.49 kB
dist/assets/index-DF-vwF15.css    7.40 kB │ gzip:  1.97 kB
dist/assets/index-CH2h2tyC.js   156.49 kB │ gzip: 50.59 kB
✓ built in 2.78s
```

## 📁 Структура проекта

```
tempmail-app/
├── README.md              # Основная документация
├── LICENSE                # Лицензия MIT
├── package.json           # Зависимости
├── vite.config.js         # Конфигурация Vite
├── index.html             # HTML шаблон
├── docs/                  # Документация
│   ├── README.md          # Документация разработчика
│   ├── TERMS.md           # Условия использования
│   ├── PRIVACY.md         # Политика конфиденциальности
│   └── FAQ.md             # Часто задаваемые вопросы
├── src/                   # Исходный код
│   ├── main.jsx           # Точка входа
│   ├── App.jsx            # Основной компонент
│   └── index.css          # Стили
├── public/                # Статические файлы
└── dist/                  # Production сборка ⭐
    ├── index.html
    └── assets/
        ├── index-*.js
        └── index-*.css
```

## 🎯 Быстрый старт

### 1. Установка зависимостей

```bash
cd tempmail-app
npm install
```

### 2. Запуск в режиме разработки

```bash
npm run dev
```

Откройте http://localhost:3000

### 3. Production сборка

```bash
npm run build
```

Файлы для деплоя будут в папке `dist/`

### 4. Предварительный просмотр production версии

```bash
npm run preview
```

Откройте http://localhost:4173

## 🌐 Развёртывание

### Вариант 1: GitHub Pages

1. Установите gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Добавьте в `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/tempmail-app",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Задеплойте:
```bash
npm run deploy
```

### Вариант 2: Vercel

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Задеплойте:
```bash
vercel
```

3. Следуйте инструкциям в терминале

### Вариант 3: Netlify

**Способ A: Через Netlify Drop**
1. Откройте https://app.netlify.com/drop
2. Перетащите папку `dist` в окно браузера

**Способ B: Через Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Вариант 4: Ваш собственный сервер

1. Соберите проект:
```bash
npm run build
```

2. Скопируйте содержимое папки `dist/` на ваш веб-сервер

3. Настройте веб-сервер (nginx пример):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # HTTPS рекомендуется
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
}
```

### Вариант 5: Docker

Создайте `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Запустите:
```bash
docker build -t tempmail-app .
docker run -p 80:80 tempmail-app
```

## ⚙️ Конфигурация

### Переменные окружения

Не требуются! Все настройки находятся в коде.

### API

Приложение использует бесплатный API 1secmail:
- URL: `https://www.1secmail.com/api/v1/`
- Не требует ключей
- Не требует регистрации

### Домены

Доступные домены для временной почты:
- 1secmail.com
- 1secmail.org
- 1secmail.net

## 🔒 Безопасность

### Обязательно для продакшена

1. **HTTPS** — используйте SSL сертификат
2. **CORS** — API поддерживает CORS
3. **Content Security Policy** — рекомендуется настроить

### Пример заголовков безопасности

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## 📊 Мониторинг

### Проверка работы

1. Откройте приложение в браузере
2. Примите условия использования
3. Скопируйте временный email
4. Отправьте тестовое письмо
5. Проверьте получение в течение 1-2 минут

### Логи

- Development: смотрите консоль браузера (F12)
- Production: логи веб-сервера

## 🐛 Решение проблем

### Чёрный экран

1. Очистите кеш браузера
2. Проверьте консоль на ошибки
3. Убедитесь, что все файлы из `dist/` загружены

### Письма не приходят

1. Подождите 1-2 минуты
2. Нажмите кнопку «Обновить»
3. Проверьте папку «Спам»
4. Проверьте работу API 1secmail

### Ошибки CORS

Убедитесь, что используете HTTPS и правильный домен.

## 📈 Производительность

### Размеры файлов

- JS: ~156 KB (gzipped: ~51 KB)
- CSS: ~7.4 KB (gzipped: ~2 KB)
- HTML: ~0.64 KB (gzipped: ~0.5 KB)

### Оптимизации

- Vite автоматически минифицирует код
- CSS и JS разделены для кэширования
- Используется code splitting

## 🔄 Обновление

Для обновления приложения:

1. Скачайте новую версию кода
2. Установите зависимости: `npm install`
3. Соберите: `npm run build`
4. Задеплойте папку `dist/`

## 📞 Поддержка

- Документация: папка `docs/`
- Issues: GitHub репозиторий
- FAQ: `docs/FAQ.md`

## 📝 Лицензия

MIT License — свободное использование с указанием авторства.

---

**Приложение готово к продакшену! 🎉**
