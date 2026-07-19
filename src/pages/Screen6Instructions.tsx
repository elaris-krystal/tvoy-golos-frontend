import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../stores/appStore';
import { addCase, addReminder, generateId, todayStr, addDays } from '../lib/db';
import type { CategoryKey } from '../types';

export default function Screen6Instructions() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [reminderSet, setReminderSet] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSetReminder() {
    if (!state.region || !state.categoryKey || !state.subcategoryKey) return;
    const caseId = generateId();
    const today = todayStr();

    await addCase({
      id: caseId,
      topic: `Запрос льгот: ${state.categoryKey} / ${state.subcategoryKey}`,
      region: state.region.name,
      category: state.categoryKey as CategoryKey,
      subcategory: state.subcategoryKey,
      date_sent: today,
      date_expected: addDays(today, 30),
      status: 'waiting',
      reminder_date: addDays(today, 25),
      escalation_count: 0,
    });

    await addReminder({
      id: generateId(),
      case_id: caseId,
      remind_at: addDays(today, 25),
      dismissed: false,
    });

    dispatch({ type: 'SET_CASE_ID', payload: caseId });
    setReminderSet(true);
  }

  async function handleCopy() {
    const text = state.editedText || state.generatedText;
    if (text) {
      await navigator.clipboard.writeText(text).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Layout title="Как отправить" subtitle="Выберите удобный способ" step={6} onBack={() => navigate('/consent')}>
      <div className="instruction-cards">
        <div className="instr-card recommended">
          <div className="instr-badge">Рекомендуется</div>
          <h3>Через Госуслуги</h3>
          <p>Авторизованная подача ускоряет рассмотрение. Прямые отправки на email с марта 2025 года часто не принимаются без идентификации через ЕСИА.</p>
          <a href="https://www.gosuslugi.ru" target="_blank" rel="noreferrer" className="btn-outline">Открыть Госуслуги ↗</a>
        </div>
        <div className="instr-card instr-card-info">
          <h3>💡 Через сайт органа</h3>
          <p>Найдите сайт нужного органа соцзащиты и воспользуйтесь разделом «Обращения граждан». Ссылка зависит от вашего региона и органа — уточните на месте.</p>
        </div>
        <div className="instr-card instr-card-info">
          <h3>💡 Лично или почтой</h3>
          <p>Сдайте обращение в канцелярию или отправьте заказным письмом с уведомлением. Сохраните подтверждение.</p>
        </div>
      </div>

      <button className="btn-secondary" onClick={handleCopy} style={{ marginTop: '1rem' }}>
        {copied ? '✓ Скопировано' : 'Скопировать текст обращения'}
      </button>

      <div className="reminder-section">
        {!reminderSet ? (
          <>
            <p className="hint-text">Напомнить проверить ответ через 25 дней?</p>
            <button className="btn-outline" onClick={handleSetReminder}>Да, напомнить</button>
          </>
        ) : (
          <div className="success-banner">✓ Кейс добавлен в Дневник. Напомним через 25 дней.</div>
        )}
      </div>

      <div className="footer-action" style={{ marginTop: '1.5rem' }}>
        <button className="btn-ghost" onClick={() => navigate('/response')}>Уже получили ответ? Загрузить</button>
        <button className="btn-ghost" onClick={() => navigate('/diary')}>Перейти в Дневник</button>
      </div>
    </Layout>
  );
}
