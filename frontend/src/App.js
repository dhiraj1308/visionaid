import React, { useState } from 'react';
import HomePage from './components/HomePage';
import BrailleChart from './components/BrailleChart';
import SpeechToBraille from './components/SpeechToBraille';
import BrailleCalendar from './components/BrailleCalendar';

function App() {
  const [page, setPage] = useState('home'); // Start directly on home page

  const handleNavigation = (target) => {
    setPage(target);
  };

  return (
    <div className="main-bg interactive-bg" style={{ minHeight: '100vh', minWidth: '100vw', position: 'relative', overflow: 'hidden' }}>
      {page === 'home' && <HomePage onNavigate={handleNavigation} />}
      {page === 'chart' && <BrailleChart onBack={() => setPage('home')} />}
      {page === 'speech' && <SpeechToBraille onBack={() => setPage('home')} />}
      {page === 'calendar' && <BrailleCalendar onBack={() => setPage('home')} />}
    </div>
  );
}

export default App;
