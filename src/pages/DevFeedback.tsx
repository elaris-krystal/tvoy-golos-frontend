import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { submitDevFeedback, ApiError } from '../lib/api';

type Category = 'bug' | 'suggestion' | 'other';

const CATEGORY_LABELS: Record<Category, string> = {
  bug: 'Ошибка / что-то сломалось',
  suggestion: 'Предложение по улучшению',
  other: 'Другое',
};

export default function DevFeedback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [category, setCategory] = useState<Category>('bug');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (message.trim().length < 5) return;
    setSubmitting(true);
    setError('');
    try {
      await submitDevFeedback({
        message: message.trim(),
        category,
        page: location.pathname,
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось отправить. Попробуйте позже.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Layout title="Спасибо" onBack={() => navigate('/diary')} showBottomNav>
        <div className="empty-card">
          <p>Сообщение отправлено. Мы читаем всё, что присылают, хотя не можем ответить лично — сообщение анонимно.</p>
        </div>
        <div className="footer-action">
          <button className="btn-primary" onClick={() => navigate('/diary')}>Вернуться в Дневник</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Обратная связь" subtitle="Сообщение анонимно, без привязки к вам" onBack={() => navigate('/diary')} showBottomNav>
      <label className="field-label" id="feedback-type-label">Тип сообщения</label>
      <div className="category-grid" role="group" aria-labelledby="feedback-type-label" style={{ gridTemplateColumns: '1fr' }}>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(key => (
          <button
            key={key}
            className={`sub-item ${category === key ? 'selected' : ''}`}
            onClick={() => setCategory(key)}
            aria-pressed={category === key}
          >
            <span>{CATEGORY_LABELS[key]}</span>
            {category === key && <span className="check">✓</span>}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="feedback-message" style={{ marginTop: '16px' }}>Сообщение</label>
      <textarea
        id="feedback-message"
        className="text-editor"
        style={{ minHeight: '120px' }}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Опишите проблему или идею. Не указывайте личные данные — сообщение анонимно и не связано с вашим аккаунтом."
      />

      {error && <div className="error-banner">{error}</div>}

      <div className="footer-action">
        <button className="btn-primary" disabled={message.trim().length < 5 || submitting} onClick={handleSubmit}>
          {submitting ? 'Отправляем…' : 'Отправить'}
        </button>
      </div>
    </Layout>
  );
}
