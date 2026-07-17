import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCases, deleteCase, getDueReminders, dismissReminder } from '../lib/db';
import type { ActiveCase, LocalReminder } from '../types';

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Ожидаем ответ', received: 'Ответ получен', escalated: 'Жалоба подана', resolved: 'Решено',
};
const STATUS_COLORS: Record<string, string> = {
  waiting: 'status-waiting', received: 'status-received', escalated: 'status-escalated', resolved: 'status-resolved',
};

function daysLeft(expected: string): number {
  const exp = new Date(expected);
  const now = new Date();
  return Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function Diary() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<ActiveCase[]>([]);
  const [dueReminders, setDueReminders] = useState<LocalReminder[]>([]);

  useEffect(() => {
    getCases().then(setCases);
    getDueReminders().then(setDueReminders);
  }, []);

  async function handleDelete(id: string) {
    await deleteCase(id);
    setCases(prev => prev.filter(c => c.id !== id));
  }

  async function handleDismissReminder(id: string) {
    await dismissReminder(id);
    setDueReminders(prev => prev.filter(r => r.id !== id));
  }

  return (
    <Layout title="Дневник аудитора" subtitle="Ваши активные обращения">
      {dueReminders.length > 0 && (
        <div className="reminder-banners">
          {dueReminders.map(r => (
            <div key={r.id} className="reminder-banner">
              <span>Пора проверить ответ на одно из ваших обращений</span>
              <div className="reminder-actions">
                <button className="btn-sm" onClick={() => navigate('/response')}>Проверить</button>
                <button className="btn-sm ghost" onClick={() => handleDismissReminder(r.id)}>Позже</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cases.length === 0 ? (
        <div className="empty-diary">
          <p>Обращений пока нет.</p>
          <button className="btn-primary" onClick={() => navigate('/region')}>Создать первое обращение</button>
        </div>
      ) : (
        <div className="cases-list">
          {cases.map(c => (
            <div key={c.id} className="case-card">
              <div className="case-header">
                <span className={`status-badge ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
                <button className="btn-delete" onClick={() => handleDelete(c.id)} aria-label="Удалить">×</button>
              </div>
              <h3 className="case-topic">{c.topic}</h3>
              <p className="case-meta">{c.region} · Отправлено {c.date_sent}</p>
              {c.status === 'waiting' && (
                <div className="countdown">
                  {daysLeft(c.date_expected) > 0 ? `Ожидаемый ответ через ${daysLeft(c.date_expected)} дн.` : 'Срок ответа истёк — рекомендуем эскалировать'}
                </div>
              )}
              {c.status === 'escalated' && (
                <div className="countdown">Эскалаций: {c.escalation_count}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="footer-action">
        <button className="btn-outline" onClick={() => navigate('/region')}>+ Новое обращение</button>
        <button className="btn-ghost" onClick={() => navigate('/promises')}>Что обещал чиновник →</button>
      </div>
    </Layout>
  );
}
