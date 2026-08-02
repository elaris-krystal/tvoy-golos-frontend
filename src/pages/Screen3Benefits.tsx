import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../stores/appStore';
import { fetchBenefits, ApiError } from '../lib/api';
import { isViolationSubcategory } from '../data/violationSubcategories';
import type { Benefit } from '../types';

const FEDERAL_FALLBACK: Record<string, Benefit[]> = {
  'family/large_family': [
    { id: -1, benefit_name: 'Материнский капитал', description: 'При рождении первого ребёнка — 630 400 ₽', legal_basis: 'ФЗ № 256-ФЗ от 29.12.2006', is_federal: true },
  ],
  'employment/unemployed': [
    { id: -3, benefit_name: 'Пособие по безработице', description: 'Мин. 1 500 ₽, макс. 12 792 ₽/мес через ЦЗН', legal_basis: 'Закон РФ № 1032-1 от 19.04.1991', is_federal: true },
  ],
  'employment/ussr_deposits': [
    { id: -7, benefit_name: 'Компенсация по вкладам СССР', description: 'Компенсация вкладов в Сбербанке СССР по состоянию на 20.06.1991', legal_basis: 'ФЗ № 73-ФЗ от 10.05.1995', is_federal: true },
  ],
  'health/disability': [
    { id: -4, benefit_name: 'ЕДВ', description: 'Размер зависит от группы инвалидности', legal_basis: 'ФЗ № 178-ФЗ от 17.07.1999', is_federal: true },
  ],
  'housing/mortgage': [
    { id: -5, benefit_name: 'Имущественный вычет', description: 'Возврат НДФЛ до 260 000 ₽', legal_basis: 'НК РФ, ст. 220', is_federal: true },
  ],
  'pension/pensioner': [
    { id: -6, benefit_name: 'Льгота по налогу на имущество', description: 'Освобождение от налога на один объект каждого вида', legal_basis: 'НК РФ, ст. 407', is_federal: true },
  ],
  // Трудовые категории — это не льготы, а рекомендации по шагам защиты прав
  'labor/salary_issues': [
    { id: -8, benefit_name: 'Компенсация за задержку зарплаты', description: 'При задержке выплаты работодатель обязан выплатить компенсацию', legal_basis: 'ТК РФ, ст. 236', is_federal: true },
    { id: -9, benefit_name: 'Обращение в Государственную инспекцию труда', description: 'Инспекция обязана провести проверку по вашему заявлению', legal_basis: 'ТК РФ, ст. 353-356', is_federal: true },
  ],
  'labor/unfair_dismissal': [
    { id: -10, benefit_name: 'Восстановление на работе', description: 'При признании увольнения незаконным — восстановление и оплата вынужденного прогула', legal_basis: 'ТК РФ, ст. 391, 392', is_federal: true },
  ],
  'labor/working_conditions': [
    { id: -11, benefit_name: 'Проверка условий труда', description: 'Работодатель обязан обеспечить безопасные условия труда', legal_basis: 'ТК РФ, ст. 212, 219', is_federal: true },
  ],
  'labor/other_labor': [
    { id: -12, benefit_name: 'Государственный надзор за трудовыми правами', description: 'Инспекция труда рассматривает любые нарушения трудового законодательства', legal_basis: 'ТК РФ, ст. 353-356', is_federal: true },
  ],
};

export default function Screen3Benefits() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!state.region || !state.categoryKey || !state.subcategoryKey) {
      navigate('/region');
      return;
    }
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBenefits(state.region!.id, state.categoryKey!, state.subcategoryKey!);
      setBenefits(data);
      setIsFallback(false);
    } catch (e) {
      const key = `${state.categoryKey}/${state.subcategoryKey}`;
      setBenefits(FEDERAL_FALLBACK[key] ?? []);
      setIsFallback(true);
      if (e instanceof ApiError && e.status >= 500) {
        setError('Сервер временно недоступен. Показаны федеральные льготы из кэша.');
      }
    } finally {
      setLoading(false);
    }
  }

  const isViolation = isViolationSubcategory(state.categoryKey, state.subcategoryKey);

  const subtitle = isFallback
    ? `Данные из кэша (${state.region?.name})`
    : isViolation
      ? `${state.region?.name ?? ''}`
      : `Льготы — ${state.region?.name ?? ''}`;

  return (
    <Layout title={isViolation ? 'Основание для обращения' : 'Вероятные льготы'} subtitle={subtitle} step={3} onBack={() => navigate('/category')}>
      {loading && <p className="loading-text">Проверяем базу…</p>}
      {error && <div className="error-banner">{error}</div>}
      {!loading && benefits.length === 0 && (
        <div className="empty-card">
          <p>
            {isViolation
              ? 'Эта категория — не про льготы, а про основание для обращения. Нажмите «Сформировать запрос», чтобы перейти к следующему шагу.'
              : 'По выбранной категории данных пока нет. Запрос в соцзащиту поможет получить точный перечень.'}
          </p>
        </div>
      )}
      {!loading && benefits.length > 0 && (
        <div className="benefits-list">
          <p className="disclaimer-small">
            {isViolation
              ? 'Это не льготы, а основания и шаги для защиты ваших прав.'
              : 'Список предварительный. Точный перечень предоставит орган соцзащиты в ответ на ваш запрос.'}
          </p>
          {benefits.map(b => (
            <div key={b.id} className="benefit-card">
              <h3 className="benefit-name">{b.benefit_name}</h3>
              <p className="benefit-desc">{b.description}</p>
              <span className="benefit-law">{b.legal_basis}</span>
            </div>
          ))}
        </div>
      )}
      <div className="footer-action">
        <button className="btn-primary" disabled={loading} onClick={() => navigate('/preview')}>
          Сформировать запрос по 59-ФЗ
        </button>
      </div>
    </Layout>
  );
}
