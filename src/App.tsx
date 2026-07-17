import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './stores/appStore';
import Screen1Region from './pages/Screen1Region';
import Screen2Category from './pages/Screen2Category';
import Screen3Benefits from './pages/Screen3Benefits';
import Screen4Preview from './pages/Screen4Preview';
import Screen5Consent from './pages/Screen5Consent';
import Screen6Instructions from './pages/Screen6Instructions';
import Screen7Response from './pages/Screen7Response';
import Module2Escalation from './pages/Module2Escalation';
import Module3Promises from './pages/Module3Promises';
import Diary from './pages/Diary';
import './module2.css';
import './escalation-cta.css';
import './module3.css';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/region" replace />} />
          <Route path="/region" element={<Screen1Region />} />
          <Route path="/category" element={<Screen2Category />} />
          <Route path="/benefits" element={<Screen3Benefits />} />
          <Route path="/preview" element={<Screen4Preview />} />
          <Route path="/consent" element={<Screen5Consent />} />
          <Route path="/instructions" element={<Screen6Instructions />} />
          <Route path="/response" element={<Screen7Response />} />
          <Route path="/escalation" element={<Module2Escalation />} />
          <Route path="/promises" element={<Module3Promises />} />
          <Route path="/diary" element={<Diary />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
