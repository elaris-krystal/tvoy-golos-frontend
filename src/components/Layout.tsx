import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  step?: number;
  onBack?: () => void;
  showDiary?: boolean;
}

const LARGE_TEXT_KEY = 'tvoy-golos-large-text';
const DARK_THEME_KEY = 'tvoy-golos-dark-theme';

export default function Layout({ children, title, subtitle, step, onBack, showDiary }: LayoutProps) {
  const navigate = useNavigate();
  const [largeText, setLargeText] = useState(() => {
    try {
      return localStorage.getItem(LARGE_TEXT_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [darkTheme, setDarkTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(DARK_THEME_KEY);
      if (saved !== null) return saved === '1';
      // Пользователь ничего не выбирал явно — уважаем системную настройку.
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LARGE_TEXT_KEY, largeText ? '1' : '0');
    } catch { /* приватный режим браузера — не критично */ }
  }, [largeText]);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_THEME_KEY, darkTheme ? '1' : '0');
    } catch { /* приватный режим браузера — не критично */ }
    // .app-shell центрирован с max-width — на широких экранах поля вокруг
    // него принадлежат <body>. Без этого при тёмной теме получилась бы
    // светлая рамка вокруг тёмного интерфейса.
    document.body.classList.toggle('dark-theme', darkTheme);
  }, [darkTheme]);

  return (
    <div className={`app-shell${largeText ? ' large-text' : ''}${darkTheme ? ' dark-theme' : ''}`}>
      <header className="app-header">
        <div className="header-left">
          {onBack && <button className="btn-icon" onClick={onBack} aria-label="Назад">←</button>}
          <span className="app-wordmark">Твой голос</span>
        </div>
        <div className="header-right">
          <button
            className="btn-icon"
            onClick={() => setDarkTheme((v) => !v)}
            aria-label={darkTheme ? 'Светлая тема' : 'Тёмная тема'}
            aria-pressed={darkTheme}
            title="Тёмная тема"
          >
            {darkTheme ? '☀️' : '🌙'}
          </button>
          <button
            className="btn-icon"
            onClick={() => setLargeText((v) => !v)}
            aria-label={largeText ? 'Обычный размер текста' : 'Крупный текст'}
            aria-pressed={largeText}
            title="Крупный текст"
          >
            {largeText ? 'A' : 'Aa'}
          </button>
          {showDiary && <button className="btn-ghost" onClick={() => navigate('/diary')}>Дневник</button>}
        </div>
      </header>
      {step && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 7) * 100}%` }} />
        </div>
      )}
      <main className="app-main">
        {(title || subtitle) && (
          <div className="screen-heading">
            {title && <h1 className="screen-title">{title}</h1>}
            {subtitle && <p className="screen-subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
      <footer className="app-footer">
        <button className="link-button link-button-muted" onClick={() => navigate('/about')}>
          Об услуге
        </button>
      </footer>
    </div>
  );
}
