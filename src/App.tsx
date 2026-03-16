import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import BracketPage from './pages/BracketPage';

function App() {
  const [choicesParam, setChoicesParam] = useState<string | null>(() =>
    new URLSearchParams(window.location.search).get('choices')
  );
  const [view, setView] = useState<'landing' | 'bracket'>(() =>
    new URLSearchParams(window.location.search).has('choices') ? 'bracket' : 'landing'
  );

  function goToLanding() {
    window.history.replaceState(null, '', window.location.pathname);
    setChoicesParam(null);
    setView('landing');
  }

  function clearChoicesParam() {
    window.history.replaceState(null, '', window.location.pathname);
    setChoicesParam(null);
  }

  if (view === 'bracket') {
    return (
      <BracketPage
        choicesParam={choicesParam}
        onGoToLanding={goToLanding}
        onClearChoicesParam={clearChoicesParam}
      />
    );
  }

  function viewBracket(encoded: string) {
    const base = window.location.pathname;
    window.history.replaceState(null, '', `${base}?choices=${encoded}`);
    setChoicesParam(encoded);
    setView('bracket');
  }

  return <LandingPage onGoToBracket={() => setView('bracket')} onViewBracket={viewBracket} />;
}

export default App;
