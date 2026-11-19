import { useState } from 'react';
import Discover from './components/Discover.jsx';

export default function App() {
  const [tab, setTab] = useState('discover');

  return (
    <div className="app">
      <main className="screen">
        {/* Home stays blank on purpose (assignment requirement) */}
        {tab === 'home' && <div className="blank" aria-label="Home" />}
        {tab === 'discover' && <Discover />}
      </main>

      <nav className="tabbar">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}>
          <span>🏠</span>Home
        </button>
        <button className={tab === 'discover' ? 'active' : ''} onClick={() => setTab('discover')}>
          <span>🔥</span>Discover
        </button>
      </nav>
    </div>
  );
}
