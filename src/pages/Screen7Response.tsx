import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../stores/appStore';
import { classifyResponse, submitFeedback, ApiError } from '../lib/api';
import type { ClassificationResult } from '../types';

const LABEL_COLORS: Record<string, string> = {
  'отписка': 'label-red',
  'слабый ответ': 'label-orange',
  'частичный ответ': 'label-yellow',
  'ответ по существу': 'label-green',
};

export default function Screen7Response() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [responseText, setResponseText] = useState(state.officialResponse);
  const [result, setResult] = useState<ClassificationResult | null>(state.classification);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const referenceText = state.editedText || state.generatedText || '';

  async function handleAnalyze() {
    if (!responseText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await classifyResponse({
        original_request: referenceText || responseText,
        official_response: responseText,
        escalation_count: state.escalationCount,
        has_new_facts: false,
        region_id: state.region?.id,
        category: state.categoryKey ?? undefined,
        subcategory: state.subcategoryKey ?? undefined,
      });
      setResult(res);
      dispatch({ type: 'SET_OFFICIAL_RESPONSE', payload: responseText });
      dispatch({ type: 'SET_CLASSIFICATION', payload: res });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось подключиться к серверу.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFeedback(userLabel: string) {
    if (!result || feedbackSent) return;
    try {
      await submitFeedback({
        original_request: referenceText,
        region_id: state.region?.id ?? 'unknown',
        category: state.categoryKey ?? 'unknown',
        subcategory: state.subcategoryKey ?? 'unknown',
        system_label: result.classification,
        user_label: userLabel,
      });
      setFeedbackSent(true);
    } catch { /* некритично */ }
  }

  const isNegative = result?.classification === 'отписка' || result?.classification === 'слабый ответ';

  return (
    <Layout title="Загрузить ответ" subtitle="Введите текст полученного ответа" step={7}
      onBack={() => navigate('/instructions')} showDiary>

      {!referenceText && (
        <div className="empty-card" style={{ marginBottom: '12px' }}>
          Классификатор точнее работает если создать обращение через полный цикл.{' '}
          <button className="btn-ghost" onClick={() => navigate('/region')}>Начать</button>
        </div>
      )}

      <textarea
        className="text-editor"
        aria-label="Текст ответа чиновника"
        placeholder="Вставьте или введите текст ответа чиновника…"
        value={responseText}
        onChange={e => setResponseText(e.target.value)}
        rows={8}
      />

      {error && <div className="error-banner">{error}</div>}

      <button
        className="btn-primary"
        disabled={!responseText.trim() || loading}
        onClick={handleAnalyze}
        style={{ marginTop: '1rem' }}
      >
        {loading ? 'Анализирую…' : 'Анализировать ответ'}
      </button>

      {result && (
        <div className="result-section">
          <div className={`classification-label ${LABEL_COLORS[result.classification] ?? ''}`}>
            {result.classification}
          </div>
          <p className="result-explanation">{result.explanation_user}</p>

          {result.escalation_warning && result.escalation_warning_text && (
            <div className="warning-banner">{result.escalation_warning_text}</div>
          )}

          {result.suggested_grounds.length > 0 && (
            <div className="grounds-list">
              <p className="grounds-title">Основания для следующего шага:</p>
              {result.suggested_grounds.map((g, i) => (
                <div key={i} className="ground-item">• {g}</div>
              ))}
            </div>
          )}

          <div className="feedback-row">
            {!feedbackSent ? (
              <>
                <span className="hint-text">Оценка верна?</span>
                <button className="btn-ghost" onClick={() => handleFeedback(result.classification)}>Да</button>
                <button className="btn-ghost" onClick={() => handleFeedback('не согласен')}>Нет</button>
              </>
            ) : (
              <span className="hint-text" style={{ color: 'var(--c-green)' }}>✓ Спасибо за оценку</span>
            )}
          </div>

          {/* Переход в Модуль 2 */}
          {isNegative && !result.escalation_warning && (
            <div className="escalation-cta">
              <p>Получена отписка. Следующий шаг — подать жалобу законно.</p>
              <button className="btn-primary" onClick={() => navigate('/escalation')}>
                Пожаловаться законно →
              </button>
            </div>
          )}

          {isNegative && result.escalation_warning && (
            <div className="escalation-hint">
              Рекомендуем добавить новые факты или документы прежде чем продолжать эскалацию.{' '}
              <button className="btn-ghost" onClick={() => navigate('/escalation')}>
                Всё равно продолжить
              </button>
            </div>
          )}

          {!isNegative && result.classification !== 'ответ по существу' && (
            <div className="escalation-hint">
              Вы можете запросить уточнение или эскалировать если часть вопросов не раскрыта.{' '}
              <button className="btn-ghost" onClick={() => navigate('/escalation')}>
                Уточнить
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
