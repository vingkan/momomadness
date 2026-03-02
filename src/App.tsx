import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BracketPage from './pages/BracketPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/bracket" element={<BracketPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
