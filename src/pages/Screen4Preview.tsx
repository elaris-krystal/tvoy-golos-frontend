import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useApp } from '../stores/appStore';
import { calcEditPct } from '../lib/db';
import { generateTemplate } from '../lib/api';
import { CATEGORIES } from '../data/categories';
import { isViolationSubcategory } from '../data/violationSubcategories';
import { useSpeech } from '../lib/useSpeech';

function localTemplate(regionName: string, categoryKey: string, subcategoryKey: string): string {
  const cat = CATEGORIES.find(c => c.key === categoryKey);
  const sub = cat?.subcategories.find(s => s.key === subcategoryKey);
  const topicLabel = `«${cat?.label ?? categoryKey}: ${sub?.label ?? subcategoryKey}»`;

  // Оффлайн-заглушка (когда бэкенд недоступен) должна учитывать, идёт ли
  // речь о льготах или о нарушении — прежний единый текст «прошу
  // предоставить перечень льгот» был бессмысленным для категорий вроде
  // ЖКХ/экологии/потребителей: получилась бы жалоба на незаконную свалку,
  // в которой почему-то просят перечислить положенные льготы.
  // "(регион: X)" вместо "в X" — сознательно избегаем падежного согласования
  // здесь: у нас нет таблицы склонений на фронтенде (она есть только на
  // бэкенде, см. app/data/region_declension.py), а дублировать её только
  // ради редкого оффлайн-fallback — лишняя сложность без реальной пользы.
  if (isViolationSubcategory(categoryKey, subcategoryKey)) {
    return `Прошу провести проверку по вопросу ${topicLabel} (регион: ${regionName}) и принять меры реагирования в пределах компетенции ведомства.\n\nВ соответствии со ст. 5 Федерального закона № 59-ФЗ от 02.05.2006 прошу рассмотреть данное обращение и предоставить исчерпывающий ответ по существу в течение 30 дней.\n\n[Черновик подготовлен без подключения к интернету — рекомендуем дополнить конкретными фактами и датами.]`;
  }

  return `Прошу предоставить актуальный перечень мер социальной поддержки для граждан категории ${topicLabel} (регион: ${regionName}).\n\nВ соответствии со ст. 5 Федерального закона № 59-ФЗ от 02.05.2006 прошу рассмотреть данное обращение и предоставить исчерпывающий ответ по существу в течение 30 дней.\n\nПрошу указать конкретные выплаты, льготы и порядок их получения.\n\n[Черновик подготовлен без подключения к интернету — рекомендуем дополнить конкретными фактами и датами.]`;
}

export default function Screen4Preview() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const originalRef = useRef('');
  const speech = useSpeech();

  useEffect(() => {
    if (!state.region || !state.categoryKey || !state.subcategoryKey) {
      navigate('/region');
      return;
    }
    loadTemplate();
  }, []);

  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setScrolledToEnd(true); }, { threshold: 0.5 });
      if (endRef.current) observer.observe(endRef.current);
      const timer = setTimeout(() => setScrolledToEnd(true), 4000);
      return () => { observer.disconnect(); clearTimeout(timer); };
    }
  }, [loading]);

  async function loadTemplate() {
    setLoading(true);
    let t = '';
    try {
      const res = await generateTemplate({
        region_id: state.region!.id,
        region_name: state.region!.name,
        category: state.categoryKey!,
        subcategory: state.subcategoryKey!,
      });
      t = res.text;
    } catch {
      t = localTemplate(state.region!.name, state.categoryKey!, state.subcategoryKey!);
    }
    originalRef.current = t;
    dispatch({ type: 'SET_GENERATED_TEXT', payload: t });
    setText(t);
    setLoading(false);
  }

  function handleContinue() {
    const pct = calcEditPct(originalRef.current, text);
    dispatch({ type: 'SET_EDITED_TEXT', payload: text });
    dispatch({ type: 'SET_EDIT_PCT', payload: pct });
    navigate('/consent');
  }

  return (
    <Layout title="Ваш запрос" subtitle="Проверьте и при необходимости добавьте детали" step={4} onBack={() => navigate('/benefits')}>
      {loading ? (
        <p className="loading-text">Формируем текст обращения…</p>
      ) : (
        <>
          <p className="hint-text">Добавление личных деталей усиливает запрос.</p>
          {state.categoryKey === 'labor' && state.subcategoryKey === 'unfair_dismissal' && (
            <div className="warning-banner">
              ⚠ Если вы хотите добиваться восстановления на работе — обращение в суд
              возможно только в течение 1 месяца со дня вручения приказа об увольнении
              (ч. 1 ст. 392 ТК РФ). Это короче срока ответа трудовой инспекции на жалобу.
              Отправка этой жалобы не приостанавливает и не продлевает месячный срок —
              рекомендуем параллельно обратиться в суд, не дожидаясь ответа на жалобу.
            </div>
          )}
          {speech.isSupported && (
            <button
              type="button"
              className="btn-outline speech-btn"
              onClick={() => speech.toggle(text)}
            >
              {speech.isSpeaking ? '⏹ Остановить' : '🔊 Прослушать текст'}
            </button>
          )}
          <textarea className="text-editor" aria-label="Текст обращения" value={text} onChange={e => setText(e.target.value)} />
          <div ref={endRef} style={{ height: 1 }} />
        </>
      )}
      <div className="footer-action">
        <button className="btn-primary" disabled={loading || !scrolledToEnd} onClick={handleContinue}>
          {loading ? 'Загружаем…' : scrolledToEnd ? 'Текст проверен — продолжить' : 'Прокрутите до конца'}
        </button>
      </div>
    </Layout>
  );
}
