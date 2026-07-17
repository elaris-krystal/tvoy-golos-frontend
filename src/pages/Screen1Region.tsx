import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { REGIONS } from '../data/regions';
import { useApp } from '../stores/appStore';
export default function Screen1Region() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(state.region);
  const filtered = REGIONS.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
  function handleSelect() { if (!selected) return; dispatch({ type: 'SET_REGION', payload: selected }); navigate('/category'); }
  return (
    <Layout title="Ваш регион" subtitle="Нужно для подбора региональных льгот" step={1} showDiary>
      <div className="search-box"><input className="input-field" type="text" placeholder="Начните вводить название..." value={query} onChange={e => setQuery(e.target.value)} autoFocus /></div>
      <div className="list-scroll">
        {filtered.length === 0 && <p className="empty-state">Ничего не найдено</p>}
        {filtered.map(r => (<button key={r.id} className={`list-item ${selected?.id === r.id ? 'selected' : ''}`} onClick={() => setSelected(r)}><span>{r.name}</span>{selected?.id === r.id && <span className="check">✓</span>}</button>))}
      </div>
      <div className="footer-action"><button className="btn-primary" disabled={!selected} onClick={handleSelect}>Продолжить</button></div>
    </Layout>
  );
}
