import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Постоянная нижняя навигация — показывается только на «внешних» экранах
 * (главная / дневник / об услуге / обратная связь), где пользователь не
 * находится в середине пошагового процесса подачи обращения. Даёт переход
 * из любого из этих разделов в любой другой за одно нажатие — раньше это
 * было устроено как книжка (только «вперёд» и «назад» по цепочке), из-за
 * чего, например, из «Дневника» вообще не было пути назад на главную.
 *
 * Во время самого процесса подачи обращения (категория → льготы → текст →
 * согласие → инструкции) навигация умышленно остаётся линейной со своим
 * прогресс-баром — прыгать по шагам без заполнения предыдущих не имеет
 * смысла для этой части сценария.
 */
const TABS = [
  { path: '/region', icon: '🏠', label: 'Главная' },
  { path: '/diary', icon: '📋', label: 'Дневник' },
  { path: '/feedback', icon: '💬', label: 'Отзыв' },
  { path: '/about', icon: 'ℹ️', label: 'Об услуге' },
] as const;

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {TABS.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
            aria-current={active ? 'page' : undefined}
          >
            <span className="bottom-nav-icon" aria-hidden="true">{tab.icon}</span>
            <span className="bottom-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
