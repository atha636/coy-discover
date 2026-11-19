export default function Matches({ matches }) {
  if (matches.length === 0) {
    return (
      <div className="state empty">
        <div className="emoji">💌</div>
        <h2>No matches yet</h2>
        <p>Keep swiping. A match only appears when you both like each other.</p>
      </div>
    );
  }
  return (
    <ul className="matches">
      {matches.map((m) => (
        <li key={m.id}>
          <img src={m.photo} alt={m.name} />
          <div>
            <strong>{m.name}, {m.age}</strong>
            <span>{m.city}</span>
            <small>{m.interests.slice(0, 3).join(' · ')}</small>
          </div>
        </li>
      ))}
    </ul>
  );
}
