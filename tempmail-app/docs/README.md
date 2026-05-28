# Документация разработчика TempMail

## Обзор проекта

TempMail — это React-приложение для создания временной электронной почты с системой активности на 90 дней.

## Архитектура

### Структура файлов

```
tempmail-app/
├── index.html              # HTML шаблон
├── package.json            # Зависимости и скрипты
├── vite.config.js          # Конфигурация Vite
├── README.md               # Основная документация
├── LICENSE                 # Лицензия MIT
├── public/                 # Статические файлы
│   └── vite.svg           # Фавикон
└── src/
    ├── main.jsx           # Точка входа React
    ├── App.jsx            # Основной компонент
    └── index.css          # Глобальные стили
```

### Технологический стек

- **React 18.2** — UI библиотека
- **Vite 5.0** — Сборщик и dev-сервер
- **CSS3** — Стилизация (без препроцессоров)
- **LocalStorage API** — Клиентское хранилище
- **Fetch API** — HTTP запросы

## Компоненты

### App.jsx

Основной компонент приложения, содержащий всю логику.

#### Состояния (State)

```javascript
// Основные состояния
const [email, setEmail] = useState('');           // Текущий email адрес
const [login, setLogin] = useState('');           // Логин (часть до @)
const [domain, setDomain] = useState('');         // Домен (часть после @)
const [emails, setEmails] = useState([]);         // Список писем
const [selectedEmail, setSelectedEmail] = useState(null);  // Выбранное письмо
const [currentFolder, setCurrentFolder] = useState('inbox'); // Текущая папка
const [createdAt, setCreatedAt] = useState(null); // Дата создания
const [lastActiveAt, setLastActiveAt] = useState(null); // Последняя активность
const [showWelcomeModal, setShowWelcomeModal] = useState(true); // Модальное окно
const [acceptedTerms, setAcceptedTerms] = useState(false); // Приняты условия
const [acceptedPrivacy, setAcceptedPrivacy] = useState(false); // Принята политика
const [activeTab, setActiveTab] = useState('terms'); // Активная вкладка
const [toast, setToast] = useState(null);         // Уведомление
const [isLoading, setIsLoading] = useState(false); // Статус загрузки
const [timeRemaining, setTimeRemaining] = useState(''); // Осталось времени
```

#### Константы

```javascript
const API_BASE = 'https://www.1secmail.com/api/v1/';  // Базовый URL API
const DAYS_MS = 24 * 60 * 60 * 1000;                   // Миллисекунд в дне
const MAX_INACTIVE_DAYS = 90;                          // Максимум дней неактивности
const AVAILABLE_DOMAINS = ['1secmail.com', '1secmail.org', '1secmail.net'];
```

#### Ключевые функции

##### `generateRandomUsername()`
Генерирует случайное имя пользователя в формате: `{прилагательное}{существительное}{число}`

##### `generateNewEmail()`
Создаёт новый временный адрес и сохраняет данные в localStorage.

##### `fetchEmails()`
Получает список писем через API 1secmail. Автоматически определяет спам.

##### `readEmail(id)`
Загружает полное содержимое письма по ID.

##### `updateActivity()`
Обновляет timestamp последней активности в localStorage.

##### `extendValidity()`
Продлевает срок действия адреса на 90 дней.

##### `copyToClipboard()`
Копирует email адрес в буфер обмена.

#### Эффекты (useEffect)

1. **Инициализация** — загрузка данных из localStorage при старте
2. **Таймер** — обновление обратного отсчёта каждую минуту
3. **Отслеживание активности** — слушатели событий пользователя
4. **Автообновление писем** — опрос API каждые 30 секунд

## API 1secmail

### Endpoints

#### Получить список писем
```
GET https://www.1secmail.com/api/v1/?action=getMessages&login={login}&domain={domain}
```

Ответ:
```json
[
  {
    "id": "12345",
    "from": "sender@example.com",
    "subject": "Тема письма",
    "date": "2026-05-28 12:00:00"
  }
]
```

#### Прочитать письмо
```
GET https://www.1secmail.com/api/v1/?action=readMessage&login={login}&domain={domain}&id={id}
```

Ответ:
```json
{
  "id": "12345",
  "from": "sender@example.com",
  "subject": "Тема письма",
  "date": "2026-05-28 12:00:00",
  "body": "Текст письма (plain text)",
  "htmlBody": "<html>...</html>",
  "attachments": []
}
```

### Доступные домены

Для получения списка доступных доменов:
```
GET https://www.1secmail.com/api/v1/?action=getDomainList
```

## LocalStorage

### Ключи

| Ключ | Тип данных | Описание |
|------|-----------|----------|
| `tempmail_email` | string | Полный email адрес |
| `tempmail_login` | string | Логин (до @) |
| `tempmail_domain` | string | Домен (после @) |
| `tempmail_created_at` | number | Timestamp создания |
| `tempmail_last_active_at` | number | Timestamp последней активности |
| `tempmail_accepted_terms` | string ('true') | Принятие условий |
| `tempmail_accepted_privacy` | string ('true') | Принятие политики |

### Пример сохранения

```javascript
localStorage.setItem('tempmail_email', newEmail);
localStorage.setItem('tempmail_login', newLogin);
localStorage.setItem('tempmail_domain', newDomain);
localStorage.setItem('tempmail_created_at', now.toString());
localStorage.setItem('tempmail_last_active_at', now.toString());
```

## Система активности

### Алгоритм

1. При любом действии пользователя вызывается `updateActivity()`
2. Текущий timestamp сохраняется в `lastActiveAt`
3. Таймер вычисляет оставшееся время: `expiryTime = lastActiveAt + (90 * DAYS_MS)`
4. Если `Date.now() > expiryTime` — генерируется новый адрес

### Отслеживаемые события

```javascript
const events = [
  'mousedown',
  'mousemove', 
  'keypress',
  'scroll',
  'touchstart',
  'click'
];
```

## Фильтрация спама

### Ключевые слова

```javascript
const spamKeywords = [
  'spam',
  'lottery',
  'winner',
  'casino',
  'crypto',
  'investment',
  'привет',
  'заработок'
];
```

### Логика

Письмо считается спамом, если тема или отправитель содержат любое из ключевых слов (регистронезависимо).

## Стили (CSS)

### Цветовая палитра

| Цвет | Hex | Использование |
|------|-----|---------------|
| Фон страницы | `#f6f8fc` | Основной фон |
| Фон карточек | `#ffffff` | Панели, модалки |
| Текст основной | `#202124` | Заголовки, текст |
| Текст вторичный | `#5f6368` | Метаданные |
| Акцент синий | `#1a73e8` | Кнопки, ссылки |
| Акцент красный | `#d93025` | Таймер, спам |
| Фон выделения | `#d3e3fd` | Активные элементы |

### Breakpoints

```css
/* Планшеты и меньше */
@media (max-width: 1024px) { ... }

/* Мобильные */
@media (max-width: 768px) { ... }
```

## Развёртывание

### Локальная разработка

```bash
npm install
npm run dev
```

### Production сборка

```bash
npm run build
```

Результат в папке `dist/`.

### Переменные окружения

Не требуются. Все настройки находятся в коде.

## Безопасность

### Рекомендации

1. **CORS** — API 1secmail поддерживает CORS
2. **HTTPS** — Обязательно для продакшена
3. **Content Security Policy** — Рекомендуется настроить
4. **XSS защита** — Используется `dangerouslySetInnerHTML` только для HTML из API

### Предупреждения

⚠️ `dangerouslySetInnerHTML` используется для отображения HTML-писем. API 1secmail должен очищать контент, но дополнительная санитизация рекомендуется.

## Тестирование

### Ручное тестирование

1. Открыть приложение
2. Принять условия
3. Скопировать email
4. Отправить тестовое письмо
5. Проверить получение
6. Проверить таймер
7. Проверить фильтр спама

### Автоматическое тестирование

В текущей версии тесты не включены. Рекомендуется добавить:
- Unit тесты для функций
- Integration тесты для компонентов
- E2E тесты для пользовательских сценариев

## Расширение функционала

### Идеи для улучшений

1. **Кастомные домены** — поддержка своих доменов
2. **Пересылка писем** — forwarding на постоянный email
3. **API для разработчиков** — REST API для управления
4. **Темы оформления** — тёмная тема, кастомные цвета
5. **Уведомления** — push notifications о новых письмах
6. **Экспорт писем** — скачивание в PDF/EML
7. **Поиск по письмам** — полнотекстовый поиск
8. **Папки** — создание пользовательских папок
9. **Множественные адреса** — несколько адресов одновременно
10. **Статистика** — графики активности, количества писем

### Добавление новой функции

1. Создать ветку `feature/new-feature`
2. Внести изменения в код
3. Обновить документацию
4. Протестировать
5. Создать Pull Request

## Лицензия

MIT License. См. файл `LICENSE`.

## Контакты

- GitHub Issues: для багов и предложений
- README.md: общая информация
- docs/: подробная документация

---

**Документация актуальна для версии 1.0.0**
