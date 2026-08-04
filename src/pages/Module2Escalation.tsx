import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../stores/appStore';
import { generateTemplate, ApiError } from '../lib/api';
import { calcEditPct, generateId, addDays, todayStr, updateCase } from '../lib/db';
import type { ClassificationResult } from '../types';

// ── Константы ──────────────────────────────────────────────────────────────

const ESCALATION_TARGETS: Record<string, string> = {
  'Орган соцзащиты': 'Министерство труда и социальной защиты',
  'ФНС': 'Федеральная налоговая служба',
  'СФР': 'Социальный фонд России',
  'ЖКХ / УК': 'Государственная жилищная инспекция',
  'Роспотребнадзор': 'Федеральная служба по надзору в сфере защиты прав потребителей',
  'Росприроднадзор': 'Федеральная служба по надзору в сфере природопользования',
  'Фонд развития территорий': 'ППК «Фонд развития территорий» (защита прав дольщиков)',
  'Трудовая инспекция': 'Государственная инспекция труда',
  'Центробанк РФ': 'Банк России (ЦБ РФ)',
  'Местная администрация': 'Администрация субъекта РФ',
  'Другой орган': 'уполномоченный орган',
};

type Takt = 1 | 2 | 3;

interface EscalationState {
  takt: Takt;
  targetOrgan: string;
  newFacts: string;
  consentGiven: boolean;
  text: string;
  loading: boolean;
  error: string;
  textScrolled: boolean;
}

// ── Вспомогательные компоненты ────────────────────────────────────────────

function TaktBadge({ current, takt, label }: { current: Takt; takt: Takt; label: string }) {
  const done = current > takt;
  const active = current === takt;
  return (
    <div className={`takt-badge ${active ? 'active' : done ? 'done' : 'pending'}`}>
      <span className="takt-num">{done ? '✓' : takt}</span>
      <span className="takt-label">{label}</span>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────────────────

export default function Module2Escalation() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const classification = state.classification;
  const escalationCount = state.escalationCount;

  const [esc, setEsc] = useState<EscalationState>({
    takt: 1,
    targetOrgan: '',
    newFacts: '',
    consentGiven: false,
    text: '',
    loading: false,
    error: '',
    textScrolled: false,
  });

  // Предупреждение ВС РФ 2026 при повторных эскалациях без новых фактов
  const showEscalationWarning = escalationCount >= 2 && !esc.newFacts.trim();

  // ── Генерация текста жалобы ──────────────────────────────────────────────

  async function generateEscalationText(takt: Takt) {
    setEsc(e => ({ ...e, loading: true, error: '' }));
    try {
      const topic = takt === 1
        ? `Запрос по 59-ФЗ: ${state.categoryKey} / ${state.subcategoryKey}`
        : takt === 2
          ? `Жалоба в прокуратуру на отписку от ${esc.targetOrgan}`
          : `Черновик административного иска по ст. 220 КАС РФ`;

      const res = await generateTemplate({
        region_id: state.region?.id ?? 'unknown',
        region_name: state.region?.name ?? '',
        category: state.categoryKey ?? 'unknown',
        subcategory: state.subcategoryKey ?? 'unknown',
        topic,
      });

      // Для такта 2 и 3 оборачиваем в соответствующий контекст
      let text = res.text;
      if (takt === 2) {
        text = buildProsecutorComplaint(text, esc.targetOrgan, esc.newFacts, state.editedText);
      } else if (takt === 3) {
        text = buildAdminClaim(text, esc.targetOrgan, state.region?.name ?? '');
      }

      setEsc(e => ({ ...e, text, loading: false, textScrolled: false }));
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Ошибка генерации. Проверьте соединение.';
      setEsc(e => ({ ...e, error: msg, loading: false }));
    }
  }

  function buildProsecutorComplaint(baseText: string, organ: string, newFacts: string, originalRequest: string): string {
    return `В прокуратуру

Прошу провести проверку в отношении ${organ} в связи с нарушением порядка рассмотрения обращений граждан (ст. 5.59 КоАП РФ).

Мной было направлено обращение следующего содержания:
«${originalRequest.slice(0, 300)}...»

Орган предоставил ответ, не отвечающий на поставленный вопрос по существу (нарушение ст. 5 ФЗ № 59-ФЗ от 02.05.2006). Право гражданина на ответ по существу является конституционным (ст. 33 Конституции РФ).${newFacts ? `\n\nДополнительные обстоятельства: ${newFacts}` : ''}

Прошу:
1. Провести проверку соблюдения ${organ} порядка рассмотрения обращений.
2. В случае нарушения — вынести представление об устранении (ст. 24 ФЗ «О прокуратуре РФ»).
3. Рассмотреть вопрос о привлечении виновного должностного лица к ответственности по ст. 5.59 КоАП РФ.

Срок ответа — 30 дней (ст. 10 ФЗ «О прокуратуре РФ»).`;
  }

  function buildAdminClaim(baseText: string, organ: string, region: string): string {
    return `ЧЕРНОВИК административного искового заявления
(ст. 218–220 КАС РФ)

ВНИМАНИЕ: это черновик. Перед подачей проконсультируйтесь с юристом.
Подача — самостоятельно через ГАС «Правосудие» с использованием УКЭП.

Административный истец: [ФИО, адрес регистрации, контактные данные]

Административный ответчик: ${organ}, ${region}

Предмет: Признание бездействия (незаконного ответа) должностного лица незаконным
Основание: ст. 218 КАС РФ

Обстоятельства дела:
Мной было направлено обращение по 59-ФЗ. Орган предоставил ответ, не содержащий ответа по существу (нарушение ст. 5 59-ФЗ). Жалоба в прокуратуру также не дала результата.

Требования:
1. Признать бездействие (незаконный ответ) ${organ} незаконным.
2. Обязать предоставить ответ по существу в течение 30 дней.

Приложения: копии обращения, ответа органа, жалобы в прокуратуру, ответа прокуратуры.`;
  }

  // ── Переходы между тактами ────────────────────────────────────────────────

  async function handleStartTakt(takt: Takt) {
    setEsc(e => ({ ...e, takt, consentGiven: false, text: '' }));
    await generateEscalationText(takt);
  }

  async function handleConsentAndProceed() {
    // Фиксируем эскалацию
    dispatch({ type: 'INCREMENT_ESCALATION' });
    if (state.currentCaseId) {
      await updateCase({
        id: state.currentCaseId,
        topic: `${state.categoryKey}/${state.subcategoryKey}`,
        region: state.region?.name ?? '',
        category: state.categoryKey!,
        subcategory: state.subcategoryKey!,
        date_sent: todayStr(),
        date_expected: addDays(todayStr(), 30),
        status: 'escalated',
        escalation_count: escalationCount + 1,
      });
    }
    // Следующий такт или завершение
    if (esc.takt < 3) {
      setEsc(e => ({ ...e, takt: (e.takt + 1) as Takt, text: '', consentGiven: false }));
    } else {
      navigate('/diary');
    }
  }

  // ── Рендер ────────────────────────────────────────────────────────────────

  const taktTitles: Record<Takt, string> = {
    1: 'Запрос по 59-ФЗ',
    2: 'Жалоба в прокуратуру',
    3: 'Черновик иска',
  };

  return (
    <Layout title="Пожаловаться законно" subtitle="Петля эскалации — три такта" showDiary>

      {/* Прогресс тактов */}
      <div className="takt-progress">
        <TaktBadge current={esc.takt} takt={1} label="59-ФЗ" />
        <div className="takt-line" />
        <TaktBadge current={esc.takt} takt={2} label="Прокуратура" />
        <div className="takt-line" />
        <TaktBadge current={esc.takt} takt={3} label="Суд (черновик)" />
      </div>

      {/* Контекст из классификатора */}
      {classification && (
        <div className="context-card">
          <span className="context-label">Оценка ответа:</span>
          <strong> {classification.classification}</strong>
          <p className="context-explanation">{classification.explanation_user}</p>
        </div>
      )}

      {/* Предупреждение ВС РФ 2026 */}
      {showEscalationWarning && (
        <div className="warning-banner">
          ⚠ Повторная эскалация без новых обстоятельств может быть расценена как злоупотребление правом (ст. 10 ГК РФ, практика ВС РФ 2026). Добавьте новые факты ниже.
        </div>
      )}

      {/* Такт 1 — стартовый экран если текста ещё нет */}
      {!esc.text && !esc.loading && (
        <div className="takt-start">
          <h2 className="takt-title">{taktTitles[esc.takt]}</h2>

          {esc.takt === 1 && (
            <>
              <p className="hint-text">
                Система сформирует обращение по 59-ФЗ на основе вашего запроса.
                Орган обязан ответить по существу в течение 30 дней.
              </p>
              <label className="field-label" htmlFor="escalation-target">Куда направляем запрос?</label>
              <select
                id="escalation-target"
                className="input-field"
                value={esc.targetOrgan}
                onChange={e => setEsc(x => ({ ...x, targetOrgan: e.target.value }))}
              >
                <option value="">— выбрать орган —</option>
                {Object.keys(ESCALATION_TARGETS).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </>
          )}

          {esc.takt === 2 && (
            <>
              <p className="hint-text">
                Предмет жалобы — не исходная проблема, а <strong>факт отписки</strong>:
                нарушение ст. 5 59-ФЗ и ст. 33 Конституции РФ.
                Прокуратура обязана провести проверку.
              </p>
              <label className="field-label" htmlFor="escalation-new-facts">Новые факты или документы (рекомендуется)</label>
              <textarea
                id="escalation-new-facts"
                className="text-editor"
                style={{ minHeight: '80px' }}
                placeholder="Добавьте новые обстоятельства если есть..."
                value={esc.newFacts}
                onChange={e => setEsc(x => ({ ...x, newFacts: e.target.value }))}
              />
              <div className="id-level-notice">
                ℹ Для подачи в прокуратуру потребуются ваши ФИО и адрес.
                Вы вводите их самостоятельно непосредственно перед отправкой.
                Система их не сохраняет.
              </div>
            </>
          )}

          {esc.takt === 3 && (
            <>
              <p className="hint-text">
                Система подготовит черновик административного иска по ст. 220 КАС РФ.
                Подача — самостоятельно через ГАС «Правосудие» с УКЭП.
              </p>
              <div className="id-level-notice warning">
                ⚠ Перед подачей иска рекомендуем проконсультироваться с юристом.
              </div>
            </>
          )}

          {esc.error && <div className="error-banner">{esc.error}</div>}

          <button
            className="btn-primary"
            style={{ marginTop: '1rem' }}
            disabled={esc.takt === 1 && !esc.targetOrgan}
            onClick={() => handleStartTakt(esc.takt)}
          >
            Сформировать текст
          </button>
        </div>
      )}

      {/* Загрузка */}
      {esc.loading && <p className="loading-text">Формируем текст…</p>}

      {/* Текст + consent */}
      {esc.text && !esc.loading && (
        <div className="escalation-text-block">
          <h2 className="takt-title">{taktTitles[esc.takt]}</h2>

          <p className="hint-text">Проверьте текст и при необходимости отредактируйте.</p>

          <textarea
            className="text-editor"
            aria-label="Текст обращения для эскалации"
            value={esc.text}
            onChange={e => setEsc(x => ({ ...x, text: e.target.value }))}
            rows={12}
            onScroll={e => {
              const el = e.currentTarget;
              if (el.scrollHeight - el.scrollTop <= el.clientHeight + 30) {
                setEsc(x => ({ ...x, textScrolled: true }));
              }
            }}
          />

          {/* Consent-экран */}
          <div className="consent-box" style={{ marginTop: '16px' }}>
            {esc.takt === 1 && (
              <p className="consent-text">
                Я подтверждаю, что направляю это обращение от своего имени
                и несу полную ответственность за его содержание.
                Система «Твой Голос» является техническим инструментом и не является моим представителем.
              </p>
            )}
            {esc.takt === 2 && (
              <>
                <p className="consent-text">
                  Для подачи жалобы в прокуратуру по закону требуются ваши ФИО и адрес.
                  Система их не хранит и не передаёт — вы вносите данные самостоятельно
                  непосредственно на сайте прокуратуры или в письме.
                </p>
                <p className="consent-text">
                  Я подтверждаю, что данная жалоба содержит{' '}
                  {esc.newFacts.trim()
                    ? 'новые обстоятельства, не рассматривавшиеся ранее'
                    : 'основания, изложенные выше'}.
                  Я действую от своего имени.
                </p>
              </>
            )}
            {esc.takt === 3 && (
              <p className="consent-text">
                Это черновик искового заявления. Я понимаю, что подача иска осуществляется
                мной самостоятельно через ГАС «Правосудие» с использованием УКЭП.
                Рекомендую проконсультироваться с юристом перед подачей.
              </p>
            )}

            <label className="checkbox-row" style={{ marginTop: '12px' }}>
              <input
                type="checkbox"
                checked={esc.consentGiven}
                onChange={e => setEsc(x => ({ ...x, consentGiven: e.target.checked }))}
              />
              <span>Я понимаю и принимаю условия</span>
            </label>
          </div>

          {esc.error && <div className="error-banner">{esc.error}</div>}

          <div className="footer-action">
            <button
              className="btn-primary"
              disabled={!esc.consentGiven}
              onClick={handleConsentAndProceed}
            >
              {esc.takt < 3 ? 'Подтвердить и перейти к следующему шагу' : 'Готово — в Дневник'}
            </button>
            <button
              className="btn-ghost"
              onClick={() => setEsc(x => ({ ...x, text: '', consentGiven: false }))}
            >
              Изменить параметры
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
