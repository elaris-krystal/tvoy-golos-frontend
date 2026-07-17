import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORIES } from '../data/categories';
import { useApp } from '../stores/appStore';
import type { CategoryKey } from '../types';
export default function Screen2Category() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [step, setStep] = useState<1|2>(state.categoryKey ? 2 : 1);
  const [selCat, setSelCat] = useState<CategoryKey|null>(state.categoryKey);
  const [selSub, setSelSub] = useState<string|null>(state.subcategoryKey);
  const activeCat = CATEGORIES.find(c => c.key === selCat);
  function handleCat(key: CategoryKey) { setSelCat(key); setSelSub(null); dispatch({ type: 'SET_CATEGORY', payload: key }); setStep(2); }
  function handleBack() { step === 2 ? setStep(1) : navigate('/region'); }
  function handleContinue() { if (!selCat || !selSub) return; dispatch({ type: 'SET_SUBCATEGORY', payload: selSub }); navigate('/benefits'); }
  return (
    <Layout title={step === 1 ? 'Ваша ситуация' : activeCat?.label ?? ''} subtitle={step === 1 ? 'Выберите категорию' : 'Уточните'} step={2} onBack={handleBack}>
      {step === 1 && <div className="category-grid">{CATEGORIES.map(c => (<button key={c.key} className={`category-card ${selCat === c.key ? 'selected' : ''}`} onClick={() => handleCat(c.key)}><span className="cat-icon">{c.icon}</span><span className="cat-label">{c.label}</span></button>))}</div>}
      {step === 2 && activeCat && (<><div className="sub-list">{activeCat.subcategories.map(s => (<button key={s.key} className={`sub-item ${selSub === s.key ? 'selected' : ''}`} onClick={() => setSelSub(s.key)}><span>{s.label}</span>{selSub === s.key && <span className="check">✓</span>}</button>))}</div><div className="footer-action"><button className="btn-primary" disabled={!selSub} onClick={handleContinue}>Найти льготы</button></div></>)}
    </Layout>
  );
}
