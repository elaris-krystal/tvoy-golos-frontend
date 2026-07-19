import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../stores/appStore';
import { fetchPromises, createPromise, votePromise, disputePromise, fetchRegionStats, ApiError } from '../lib/api';
import { getDeviceHash } from '../lib/db';
import type { CivicPromise, RegionStats } from '../types';

const STATUS_LABELS: Record<string, string> = {
  checking: 'Проверяется', fulfilled: 'Выполнено', broken: 'Не выполнено',
};
const STATUS_COLORS: Record<string, string> = {
  checking: 'label-yellow', fulfilled: 'label-green', broken: 'label-red',
};

export default function Module3Promises() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [promises, setPromises] = useState<CivicPromise[]>([]);
  const [stats, setStats] = useState<RegionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());
  const [disputedIds, setDisputedIds] = useState<Set<number>>(new Set());

  const regionId = state.region?.id;

  useEffect(() => {
    if (!regionId) {
      navigate('/region');
      return;
    }
    load();
  }, [regionId]);

  async function load() {
    if (!regionId) return;
    setLoading(true);
    setError('');
    try {
      const [list, s] = await Promise.all([
        fetchPromises(regionId),
        fetchRegionStats(regionId),
      ]);
      setPromises(list);
      setStats(s);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось загрузить обещания.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(promiseId: number, vote: 'fulfilled' | 'broken') {
    try {
      const updated = await votePromise(promiseId, vote, getDeviceHash());
      setPromises(prev => prev.map(p => p.id === promiseId ? updated : p));
      setVotedIds(prev => new Set(prev).add(promiseId));
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setVotedIds(prev => new Set(prev).add(promiseId));
      }
    }
  }

  async function handleDispute(promiseId: number) {
    try {
      await disputePromise(promiseId, 'fabricated', getDeviceHash());
      setDisputedIds(prev => new Set(prev).add(promiseId));
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setDisputedIds(prev => new Set(prev).add(promiseId));
      }
    }
  }

  return (
    <Layout title="Что обещал чиновник" subtitle={state.region?.name} showDiary>
      {stats && stats.total_promises > 0 && (
        <div className="stat-row">
          <div className="stat"><div className="stat-num">{stats.total_promises}</div><div className="stat-label">обещаний</div></div>
          <div className="stat"><div className="stat-num">{stats.fulfilled_count}</div><div className="stat-label">выполнено</div></div>
          <div className="stat"><div className="stat-num">{stats.broken_count}</div><div className="stat-label">не выполнено</div></div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}
      {loading && <p className="loading-text">Загружаем…</p>}

      {!loading && promises.length === 0 && !error && (
        <div className="empty-card">
          <p>В вашем регионе пока нет добавленных обещаний. Будьте первым — это помогает всем.</p>
        </div>
      )}

      {!loading && promises.length > 0 && (
        <div className="promises-list">
          {promises.map(p => (
            <div key={p.id} className="promise-card">
              <div className="promise-header">
                <span className={`classification-label ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
              </div>
              <p className="promise-text">«{p.promise_text}»</p>
              <p className="promise-meta">{p.official_role} {p.official_name} · {p.promise_date ?? p.created_at.slice(0, 10)}</p>
              <a href={p.source_url} target="_blank" rel="noreferrer" className="promise-source">Источник ↗</a>

              {votedIds.has(p.id) ? (
                <p className="hint-text" style={{ marginTop: '8px' }}>✓ Спасибо за оценку</p>
              ) : (
                <div className="vote-row">
                  <span className="hint-text">Выполнено?</span>
                  <button className="btn-sm ghost" onClick={() => handleVote(p.id, 'fulfilled')}>Да ({p.votes_fulfilled})</button>
                  <button className="btn-sm ghost" onClick={() => handleVote(p.id, 'broken')}>Нет ({p.votes_broken})</button>
                </div>
              )}

              {disputedIds.has(p.id) ? (
                <p className="hint-text" style={{ marginTop: '4px', color: 'var(--c-text-2)' }}>Жалоба отправлена, спасибо</p>
              ) : (
                <button className="btn-ghost promise-dispute-btn" onClick={() => handleDispute(p.id)}>
                  ⚠ Эта информация недостоверна
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <div className="footer-action">
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ Добавить обещание</button>
        </div>
      ) : (
        <AddPromiseForm
          regionId={regionId!}
          onDone={(created) => {
            setPromises(prev => [created, ...prev]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </Layout>
  );
}

function AddPromiseForm({
  regionId, onDone, onCancel,
}: {
  regionId: string;
  onDone: (p: CivicPromise) => void;
  onCancel: () => void;
}) {
  const [officialName, setOfficialName] = useState('');
  const [officialRole, setOfficialRole] = useState('');
  const [promiseText, setPromiseText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = officialName.trim() && officialRole.trim() &&
    promiseText.trim().length >= 10 && sourceUrl.trim().startsWith('http') &&
    accuracyConfirmed;

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await createPromise({
        region_id: regionId,
        official_name: officialName.trim(),
        official_role: officialRole.trim(),
        promise_text: promiseText.trim(),
        source_url: sourceUrl.trim(),
        device_hash: getDeviceHash(),
        accuracy_confirmed: accuracyConfirmed,
      });
      onDone(created);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Не удалось добавить обещание.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="promise-form">
      <h3 className="takt-title">Новое обещание</h3>

      <label className="field-label">Должность (например, «Мэр», «Глава района»)</label>
      <input className="input-field" value={officialRole} onChange={e => setOfficialRole(e.target.value)} placeholder="Глава района" />

      <label className="field-label">ФИО (публичная информация)</label>
      <input className="input-field" value={officialName} onChange={e => setOfficialName(e.target.value)} placeholder="Иванов И.И." />

      <label className="field-label">Текст обещания</label>
      <textarea className="text-editor" style={{ minHeight: '80px' }} value={promiseText} onChange={e => setPromiseText(e.target.value)} placeholder="Дорогу отремонтируем до конца года" />

      <label className="field-label">Ссылка на источник (СМИ, официальный сайт)</label>
      <input className="input-field" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." />

      <div className="consent-box" style={{ marginTop: '12px' }}>
        <p className="consent-text">
          Вы публично приписываете эти слова конкретному названному человеку. Убедитесь, что ссылка
          на источник действительно подтверждает текст обещания дословно или по смыслу.
          Распространение недостоверных сведений о человеке может повлечь ответственность
          (ст. 152 ГК РФ). Другие пользователи могут пожаловаться на недостоверную запись —
          после нескольких жалоб она скрывается до проверки.
        </p>
        <label className="checkbox-row" style={{ marginTop: '8px', marginBottom: 0 }}>
          <input type="checkbox" checked={accuracyConfirmed} onChange={e => setAccuracyConfirmed(e.target.checked)} />
          <span>Я подтверждаю, что информация достоверна и подтверждена источником</span>
        </label>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="footer-action">
        <button className="btn-primary" disabled={!isValid || submitting} onClick={handleSubmit}>
          {submitting ? 'Добавляем…' : 'Добавить'}
        </button>
        <button className="btn-ghost" onClick={onCancel}>Отмена</button>
      </div>
    </div>
  );
}
