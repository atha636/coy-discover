import { motion } from 'framer-motion';

const hearts = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: (i * 7 + 5) % 95,
  delay: (i % 7) * 0.25,
  size: 16 + (i % 4) * 8
}));

export default function MatchModal({ profile, onClose, onSeeMatches }) {
  return (
    <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {hearts.map((h) => (
        <span key={h.id} className="heart" style={{ left: `${h.left}%`, animationDelay: `${h.delay}s`, fontSize: h.size }}>♥</span>
      ))}
      <motion.div
        className="match-box"
        initial={{ scale: 0.5, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
      >
        <h1>It's a match!</h1>
        <p>You and {profile.name} liked each other.</p>
        <motion.img
          src={profile.photo}
          alt={profile.name}
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.15 }}
        />
        <button className="primary" onClick={onSeeMatches}>See matches</button>
        <button className="ghost" onClick={onClose}>Keep swiping</button>
      </motion.div>
    </motion.div>
  );
}