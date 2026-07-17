import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function Screen5Consent() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  return (
    <Layout title="Подтверждение" step={5} onBack={() => navigate('/preview')}>
      <div className="consent-box">
        <p className="consent-text">
          Я подтверждаю, что ознакомился с текстом обращения. Я направляю его от своего имени и несу полную ответственность за его содержание.
        </p>
        <p className="consent-text">
          Система «Твой Голос» является техническим инструментом помощи в составлении текста и <strong>не является</strong> юридическим представителем или адвокатом.
        </p>
        <p className="consent-text">Тексты носят рекомендательный характер. Проверьте содержание перед отправкой.</p>
      </div>
      <label className="checkbox-row">
        <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />
        <span>Я понимаю и принимаю условия</span>
      </label>
      <div className="footer-action">
        <button className="btn-primary" disabled={!checked} onClick={() => navigate('/instructions')}>
          Продолжить
        </button>
      </div>
    </Layout>
  );
}
