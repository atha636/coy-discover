import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import { getFeed, getMatches, swipe, resetDemo } from '../api.js';
import SwipeCard from './SwipeCard.jsx';
import MatchModal from './MatchModal.jsx';
import Matches from './Matches.jsx';

export default function Discover() {
  const [view, setView] = useState('cards'); // 'cards' | 'matches'
  const [cards, setCards] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [matchProfile, setMatchProfile] = useState(null);
  const busy = useRef(false);
  const topRef = useRef(null);
  const dragX = useMotionValue(0); // shared drag position of the top card

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [feed, m] = await Promise.all([getFeed(), getMatches()]);
      setCards(feed.profiles);
      setMatches(m.matches);
    } catch {
      setError('Could not reach the server. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // When the top card changes, reset the shared drag position before paint
  useLayoutEffect(() => { dragX.set(0); }, [cards[0]?.id, dragX]);

  // Called by the card as soon as a swipe is committed.
  const handleSwiped = async (profile, action) => {
    busy.current = true;
    try {
      const result = await swipe(profile.id, action);
      setCards((prev) => prev.filter((c) => c.id !== profile.id));
      if (result.match) {
        setMatches((prev) => [{ ...result.profile, matchedAt: new Date().toISOString() }, ...prev]);
        setMatchProfile(result.profile);
        navigator.vibrate?.([30, 40, 30]);
      }
    } catch (e) {
      // 409 = already swiped; drop it from the deck either way
      if (e.status === 409) setCards((prev) => prev.filter((c) => c.id !== profile.id));
      else {
        setError('Swipe failed. Please try again.');
        topRef.current?.reset?.();
      }
    } finally {
      busy.current = false;
    }
  };

  const triggerSwipe = (dir) => {
    if (busy.current) return;
    topRef.current?.swipe(dir);
  };

  const handleReset = async () => {
    await resetDemo();
    load();
  };

  return (
    <div className="discover">
      <header className="topbar">
        <h1>Coy</h1>
        <div className="segmented">
          <button className={view === 'cards' ? 'active' : ''} onClick={() => setView('cards')}>
            Cards
          </button>
          <button className={view === 'matches' ? 'active' : ''} onClick={() => setView('matches')}>
            Matches{matches.length > 0 && <b className="badge">{matches.length}</b>}
          </button>
        </div>
      </header>

      {view === 'matches' ? (
        <Matches matches={matches} />
      ) : loading ? (
        <div className="state">Loading…</div>
      ) : error ? (
        <div className="state">
          <p>{error}</p>
          <button className="primary" onClick={load}>Retry</button>
        </div>
      ) : cards.length === 0 ? (
        <div className="state empty">
          <div className="emoji">🌙</div>
          <h2>You're all caught up</h2>
          <p>No more profiles for now. Check back later, or see who you've matched with.</p>
          <button className="primary" onClick={() => setView('matches')}>View matches</button>
          <button className="ghost" onClick={handleReset}>Reset demo data</button>
        </div>
      ) : (
        <>
          <div className="deck">
            {cards.slice(0, 2).reverse().map((p) => {
              const isTop = p.id === cards[0].id;
              return (
                <SwipeCard
                  key={p.id}
                  profile={p}
                  isTop={isTop}
                  dragX={dragX}
                  ref={isTop ? topRef : null}
                  onSwiped={handleSwiped}
                />
              );
            })}
          </div>
          <div className="actions">
            <button className="round pass" aria-label="Pass" onClick={() => triggerSwipe(-1)}>✕</button>
            <button className="round like" aria-label="Like" onClick={() => triggerSwipe(1)}>♥</button>
          </div>
          <p className="hint">Drag the card or use the buttons</p>
        </>
      )}

      {matchProfile && (
        <MatchModal
          profile={matchProfile}
          onClose={() => setMatchProfile(null)}
          onSeeMatches={() => { setMatchProfile(null); setView('matches'); }}
        />
      )}
    </div>
  );
}