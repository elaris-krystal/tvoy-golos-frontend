import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  step?: number;
  onBack?: () => void;
  showDiary?: boolean;
}

export default function Layout({ children, title, subtitle, step, onBack, showDiary }: LayoutProps) {
  const navigate = useNavigate();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-left">
          {onBack && <button className="btn-icon" onClick={onBack} aria-label="Назад">←</button>}
          <span className="app-wordmark">Твой голос</span>
        </div>
        {showDiary && <button className="btn-ghost" onClick={() => navigate('/diary')}>Дневник</button>}
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
    </div>
  );
}
