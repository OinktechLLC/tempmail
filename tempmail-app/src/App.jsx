import { useState, useEffect, useCallback } from 'react';

// API конфигурация - используем 1secmail API (бесплатный, без ключей)
const API_BASE = 'https://www.1secmail.com/api/v1/';

// Утилиты для работы с временем
const DAYS_MS = 24 * 60 * 60 * 1000;
const MAX_INACTIVE_DAYS = 90;

// Генерация случайного имени пользователя
const generateRandomUsername = () => {
  const adjectives = ['quick', 'smart', 'brave', 'calm', 'eager', 'gentle', 'happy', 'jolly', 'kind', 'lively'];
  const nouns = ['tiger', 'eagle', 'wolf', 'bear', 'hawk', 'lion', 'fox', 'deer', 'owl', 'swan'];
  const numbers = Math.floor(Math.random() * 1000);
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${numbers}`;
};

// Домены от 1secmail
const AVAILABLE_DOMAINS = ['1secmail.com', '1secmail.org', '1secmail.net'];

function App() {
  // Состояния приложения
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [domain, setDomain] = useState('');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('inbox'); // inbox, spam, starred
  const [createdAt, setCreatedAt] = useState(null);
  const [lastActiveAt, setLastActiveAt] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [activeTab, setActiveTab] = useState('terms');
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  // Загрузка данных из localStorage при старте
  useEffect(() => {
    const savedEmail = localStorage.getItem('tempmail_email');
    const savedLogin = localStorage.getItem('tempmail_login');
    const savedDomain = localStorage.getItem('tempmail_domain');
    const savedCreatedAt = localStorage.getItem('tempmail_created_at');
    const savedLastActiveAt = localStorage.getItem('tempmail_last_active_at');
    const savedAcceptedTerms = localStorage.getItem('tempmail_accepted_terms');
    const savedAcceptedPrivacy = localStorage.getItem('tempmail_accepted_privacy');

    if (savedAcceptedTerms === 'true' && savedAcceptedPrivacy === 'true') {
      setAcceptedTerms(true);
      setAcceptedPrivacy(true);
      setShowWelcomeModal(false);
    }

    if (savedEmail && savedLogin && savedDomain && savedCreatedAt) {
      const createdTime = parseInt(savedCreatedAt);
      const lastActiveTime = savedLastActiveAt ? parseInt(savedLastActiveAt) : createdTime;
      const now = Date.now();
      const inactiveDays = (now - lastActiveTime) / DAYS_MS;

      // Если прошло больше 90 дней неактивности - генерируем новую почту
      if (inactiveDays > MAX_INACTIVE_DAYS) {
        generateNewEmail();
      } else {
        setEmail(savedEmail);
        setLogin(savedLogin);
        setDomain(savedDomain);
        setCreatedAt(createdTime);
        setLastActiveAt(lastActiveTime);
        updateActivity(); // Обновляем активность при входе
      }
    } else {
      generateNewEmail();
    }
  }, []);

  // Обновление таймера обратного отсчета
  useEffect(() => {
    if (!lastActiveAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiryTime = lastActiveAt + (MAX_INACTIVE_DAYS * DAYS_MS);
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Истекло');
      } else {
        const days = Math.floor(remaining / DAYS_MS);
        const hours = Math.floor((remaining % DAYS_MS) / (1000 * 60 * 60));
        setTimeRemaining(`${days} дн. ${hours} ч.`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Обновляем каждую минуту
    return () => clearInterval(interval);
  }, [lastActiveAt]);

  // Обновление активности пользователя
  const updateActivity = useCallback(() => {
    const now = Date.now();
    setLastActiveAt(now);
    localStorage.setItem('tempmail_last_active_at', now.toString());
  }, []);

  // Отслеживание активности пользователя
  useEffect(() => {
    const handleUserActivity = () => {
      if (email && lastActiveAt) {
        updateActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [email, lastActiveAt, updateActivity]);

  // Генерация новой почты
  const generateNewEmail = useCallback(() => {
    const newLogin = generateRandomUsername();
    const newDomain = AVAILABLE_DOMAINS[Math.floor(Math.random() * AVAILABLE_DOMAINS.length)];
    const newEmail = `${newLogin}@${newDomain}`;
    const now = Date.now();

    setLogin(newLogin);
    setDomain(newDomain);
    setEmail(newEmail);
    setCreatedAt(now);
    setLastActiveAt(now);
    setEmails([]);
    setSelectedEmail(null);

    localStorage.setItem('tempmail_email', newEmail);
    localStorage.setItem('tempmail_login', newLogin);
    localStorage.setItem('tempmail_domain', newDomain);
    localStorage.setItem('tempmail_created_at', now.toString());
    localStorage.setItem('tempmail_last_active_at', now.toString());

    showToast('Новый адрес создан!');
  }, []);

  // Получение писем
  const fetchEmails = useCallback(async () => {
    if (!login || !domain) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}?action=getMessages&login=${login}&domain=${domain}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        // Определяем спам по ключевым словам в теме или отправителе
        const spamKeywords = ['spam', 'lottery', 'winner', 'casino', 'crypto', 'investment', 'привет', 'заработок'];
        
        const processedEmails = data.map(email => {
          const isSpam = spamKeywords.some(keyword => 
            email.subject.toLowerCase().includes(keyword) || 
            email.from.toLowerCase().includes(keyword)
          );
          return { ...email, isSpam, isStarred: false };
        });

        setEmails(processedEmails);
        updateActivity();
      }
    } catch (error) {
      console.error('Ошибка получения писем:', error);
    } finally {
      setIsLoading(false);
    }
  }, [login, domain, updateActivity]);

  // Чтение письма
  const readEmail = useCallback(async (id) => {
    if (!login || !domain) return;

    try {
      const response = await fetch(`${API_BASE}?action=readMessage&login=${login}&domain=${domain}&id=${id}`);
      const data = await response.json();
      setSelectedEmail(data);
      updateActivity();
    } catch (error) {
      console.error('Ошибка чтения письма:', error);
    }
  }, [login, domain, updateActivity]);

  // Автообновление писем каждые 30 секунд
  useEffect(() => {
    if (!email) return;

    fetchEmails();
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [email, fetchEmails]);

  // Копирование email в буфер обмена
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email скопирован в буфер обмена');
      updateActivity();
    } catch (err) {
      showToast('Не удалось скопировать');
    }
  };

  // Показ уведомления
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Принятие условий
  const handleAcceptTerms = () => {
    if (acceptedTerms && acceptedPrivacy) {
      localStorage.setItem('tempmail_accepted_terms', 'true');
      localStorage.setItem('tempmail_accepted_privacy', 'true');
      setShowWelcomeModal(false);
      if (!email) {
        generateNewEmail();
      }
    }
  };

  // Фильтрация писем по папке
  const getFilteredEmails = () => {
    switch (currentFolder) {
      case 'spam':
        return emails.filter(e => e.isSpam);
      case 'starred':
        return emails.filter(e => e.isStarred);
      default:
        return emails.filter(e => !e.isSpam);
    }
  };

  // Продление активности на 90 дней
  const extendValidity = () => {
    const now = Date.now();
    setLastActiveAt(now);
    localStorage.setItem('tempmail_last_active_at', now.toString());
    showToast('Срок действия продлён на 90 дней!');
  };

  const filteredEmails = getFilteredEmails();
  const unreadCount = emails.filter(e => !e.isSpam && !selectedEmail).length;
  const spamCount = emails.filter(e => e.isSpam).length;

  return (
    <div className="app-container">
      {/* Модальное окно приветствия */}
      {showWelcomeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Добро пожаловать в TempMail</h2>
              <button className="close-btn" onClick={() => {}} disabled>×</button>
            </div>
            <div className="modal-content">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'terms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('terms')}
                >
                  Условия использования
                </button>
                <button 
                  className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
                  onClick={() => setActiveTab('privacy')}
                >
                  Политика конфиденциальности
                </button>
                <button 
                  className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  О проекте
                </button>
              </div>

              {activeTab === 'terms' && (
                <div>
                  <h3>Условия использования сервиса TempMail</h3>
                  <p>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
                  
                  <h4>1. Общие положения</h4>
                  <p>
                    Используя сервис TempMail, вы соглашаетесь с настоящими Условиями использования. 
                    Сервис предоставляет временные адреса электронной почты сроком на 90 дней.
                  </p>

                  <h4>2. Срок действия почты</h4>
                  <ul>
                    <li>Временный адрес действует 90 дней с момента последней активности</li>
                    <li>Любое действие пользователя продлевает срок действия ещё на 90 дней</li>
                    <li>При неактивности более 90 дней адрес автоматически меняется на новый</li>
                  </ul>

                  <h4>3. Правила использования</h4>
                  <ul>
                    <li>Запрещено использовать сервис для рассылки спама</li>
                    <li>Запрещено использовать сервис для незаконной деятельности</li>
                    <li>Сервис не гарантирует доставку всех писем</li>
                    <li>Не используйте для важных аккаунтов (банки, госуслуги)</li>
                  </ul>

                  <h4>4. Ограничения ответственности</h4>
                  <p>
                    Сервис предоставляется «как есть». Мы не несём ответственности за потерю писем 
                    или недоступность сервиса.
                  </p>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h3>Политика конфиденциальности</h3>
                  <p>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>

                  <h4>1. Сбор данных</h4>
                  <p>
                    Мы минимизируем сбор данных. Хранятся только:
                  </p>
                  <ul>
                    <li>Временный адрес электронной почты (в localStorage браузера)</li>
                    <li>Дата создания и последней активности</li>
                    <li>Письма, полученные на ваш временный адрес</li>
                  </ul>

                  <h4>2. Использование данных</h4>
                  <p>
                    Данные используются исключительно для функционирования сервиса:
                  </p>
                  <ul>
                    <li>Отображение ваших писем</li>
                    <li>Отслеживание активности для продления срока действия</li>
                    <li>Автоматическая смена адреса при неактивности</li>
                  </ul>

                  <h4>3. Хранение данных</h4>
                  <ul>
                    <li>Данные хранятся локально в вашем браузере (localStorage)</li>
                    <li>Мы не передаём данные третьим лицам</li>
                    <li>Письма удаляются автоматически при смене адреса</li>
                  </ul>

                  <h4>4. Ваши права</h4>
                  <p>
                    Вы можете в любой момент:
                  </p>
                  <ul>
                    <li>Сгенерировать новый адрес</li>
                    <li>Очистить данные браузера</li>
                    <li>Прекратить использование сервиса</li>
                  </ul>

                  <h4>5. Безопасность</h4>
                  <p>
                    Помните: временная почта не предназначена для конфиденциальной информации. 
                    Не используйте её для важных аккаунтов.
                  </p>
                </div>
              )}

              {activeTab === 'about' && (
                <div>
                  <h3>О проекте TempMail</h3>
                  
                  <h4>Суть проекта</h4>
                  <p>
                    TempMail — это сервис временной электронной почты, который позволяет вам 
                    получать письма без регистрации и раскрытия вашего реального адреса.
                  </p>

                  <h4>Ключевые особенности</h4>
                  <ul>
                    <li><strong>90 дней активности:</strong> Ваш адрес действует 90 дней, пока вы активны</li>
                    <li><strong>Автоматическое продление:</strong> Любое действие продлевает срок на 90 дней</li>
                    <li><strong>Фильтр спама:</strong> Подозрительные письма автоматически попадают в спам</li>
                    <li><strong>Бесплатно:</strong> Полностью бесплатный сервис без регистрации</li>
                    <li><strong>Конфиденциально:</strong> Данные хранятся только в вашем браузере</li>
                  </ul>

                  <h4>Как это работает</h4>
                  <ol>
                    <li>При первом посещении создаётся уникальный временный адрес</li>
                    <li>Вы можете использовать его для регистраций на сайтах</li>
                    <li>Письма автоматически появляются во входящих</li>
                    <li>Если вы не заходите 90 дней — адрес меняется на новый</li>
                    <li>Если активны — срок продлевается бесконечно</li>
                  </ol>

                  <h4>Технологии</h4>
                  <p>
                    Сервис использует API 1secmail для получения писем. 
                    Фронтенд построен на React с использованием современных практик.
                  </p>
                </div>
              )}

              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="accept-terms" 
                  className="checkbox-input"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="accept-terms" className="checkbox-label">
                  Я прочитал и принимаю Условия использования
                </label>
              </div>

              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="accept-privacy" 
                  className="checkbox-input"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                />
                <label htmlFor="accept-privacy" className="checkbox-label">
                  Я прочитал и принимаю Политику конфиденциальности
                </label>
              </div>

              <button 
                className="accept-btn" 
                onClick={handleAcceptTerms}
                disabled={!acceptedTerms || !acceptedPrivacy}
              >
                Принять и продолжить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">T</div>
          <span>TempMail</span>
        </div>
        <div className="header-actions">
          <button className="icon-button" title="Настройки" onClick={() => setActiveTab('about')}>
            ⚙️
          </button>
          <button className="icon-button" title="Справка" onClick={() => setShowWelcomeModal(true)}>
            ❓
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav>
            <div 
              className={`nav-item inbox ${currentFolder === 'inbox' ? 'active' : ''}`}
              onClick={() => { setCurrentFolder('inbox'); setSelectedEmail(null); }}
            >
              <span>📥</span>
              <span>Входящие</span>
              {unreadCount > 0 && <span className="nav-count">{unreadCount}</span>}
            </div>
            
            <div 
              className={`nav-item ${currentFolder === 'spam' ? 'active' : ''}`}
              onClick={() => { setCurrentFolder('spam'); setSelectedEmail(null); }}
            >
              <span>⚠️</span>
              <span>Спам</span>
              {spamCount > 0 && <span className="nav-count">{spamCount}</span>}
            </div>
            
            <div 
              className={`nav-item ${currentFolder === 'starred' ? 'active' : ''}`}
              onClick={() => { setCurrentFolder('starred'); setSelectedEmail(null); }}
            >
              <span>⭐</span>
              <span>Избранное</span>
            </div>
          </nav>
        </aside>

        {/* Email Panel */}
        <section className="email-panel">
          <div className="panel-header">
            <h1 className="panel-title">
              {currentFolder === 'inbox' && 'Входящие'}
              {currentFolder === 'spam' && 'Спам'}
              {currentFolder === 'starred' && 'Избранное'}
            </h1>
            <button className="refresh-btn" onClick={fetchEmails} disabled={isLoading}>
              {isLoading ? '↻' : '⟳'} Обновить
            </button>
          </div>

          {selectedEmail ? (
            <div className="email-view">
              <div className="email-view-header">
                <h2 className="email-view-subject">{selectedEmail.subject}</h2>
                <div className="email-view-meta">
                  <div className="avatar">
                    {selectedEmail.from.charAt(0).toUpperCase()}
                  </div>
                  <div className="sender-info">
                    <div className="sender-name">{selectedEmail.from}</div>
                    <div className="sender-email">{selectedEmail.date}</div>
                  </div>
                </div>
              </div>
              <div 
                className="email-view-body"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody || selectedEmail.body }}
              />
            </div>
          ) : filteredEmails.length > 0 ? (
            <div className="email-list">
              {filteredEmails.map((emailItem) => (
                <div 
                  key={emailItem.id} 
                  className={`email-item ${emailItem.read ? '' : 'unread'}`}
                  onClick={() => readEmail(emailItem.id)}
                >
                  <input type="checkbox" className="checkbox" readOnly />
                  <button 
                    className="star-btn"
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    {emailItem.isStarred ? '⭐' : '☆'}
                  </button>
                  <div className="email-sender">{emailItem.from}</div>
                  <div className="email-subject">{emailItem.subject}</div>
                  <div className="email-date">{emailItem.date}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">
                {currentFolder === 'inbox' && 'Нет новых писем'}
                {currentFolder === 'spam' && 'Нет писем в спаме'}
                {currentFolder === 'starred' && 'Нет избранных писем'}
              </div>
            </div>
          )}
        </section>

        {/* Info Panel */}
        <aside className="info-panel">
          <div className="info-card">
            <h3 className="info-card-title">Ваш временный адрес</h3>
            <div className="email-display">
              <div className="email-address">{email}</div>
              <button className="copy-btn" onClick={copyToClipboard}>
                📋 Копировать
              </button>
            </div>
            
            <div className="timer-display">
              <div className="timer-label">Действителен ещё:</div>
              <div className="timer-value">{timeRemaining}</div>
            </div>

            <button className="extend-btn" onClick={extendValidity}>
              ↻ Продлить на 90 дней
            </button>
            
            <button className="generate-new-btn" onClick={generateNewEmail}>
              🔄 Создать новый адрес
            </button>
          </div>

          <div className="info-card">
            <h3 className="info-card-title">ℹ️ Как это работает</h3>
            <p style={{ fontSize: '13px', color: '#5f6368', lineHeight: '1.6' }}>
              • Адрес действует 90 дней<br/>
              • Активность продлевает срок<br/>
              • Спам фильтруется автоматически<br/>
              • Данные только в браузере
            </p>
          </div>
        </aside>
      </main>

      {/* Toast notification */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default App;
