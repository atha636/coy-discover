import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { DB_PATH, writeSeed } from './seed.js';

const PORT = process.env.PORT || 4000;
if (!fs.existsSync(DB_PATH)) writeSeed();

const load = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
const save = (db) => {
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH); // atomic write
};

// PRIVACY: the only shape of a profile that ever leaves the server.
// `likedYou` is intentionally not included.
const publicProfile = ({ id, name, age, photo, bio, city, interests }) => ({
  id, name, age, photo, bio, city, interests
});

const router = express.Router();

// Profiles the user has not swiped on yet.
router.get('/feed', (_req, res) => {
  const db = load();
  const swiped = new Set(db.swipes.map((s) => s.profileId));
  res.json({ profiles: db.profiles.filter((p) => !swiped.has(p.id)).map(publicProfile) });
});

// Record a like/pass. Response only says whether THIS swipe created a match.
router.post('/swipe', (req, res) => {
  const { profileId, action } = req.body || {};
  if (!Number.isInteger(profileId) || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'profileId (int) and action ("like"|"pass") are required' });
  }
  const db = load();
  const profile = db.profiles.find((p) => p.id === profileId);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  if (db.swipes.some((s) => s.profileId === profileId)) {
    return res.status(409).json({ error: 'Already swiped on this profile' });
  }

  db.swipes.push({ profileId, action, at: new Date().toISOString() });

  // Mutual only: they must have liked us AND we are liking them now.
  const match = action === 'like' && profile.likedYou === true;
  if (match) db.matches.push({ profileId, at: new Date().toISOString() });
  save(db);

  // Same shape for "pass" and "like, no match" so nothing can be inferred.
  res.json(match ? { match: true, profile: publicProfile(profile) } : { match: false });
});

// Mutual matches only.
router.get('/matches', (_req, res) => {
  const db = load();
  const matches = db.matches
    .map((m) => {
      const p = db.profiles.find((x) => x.id === m.profileId);
      return p ? { ...publicProfile(p), matchedAt: m.at } : null;
    })
    .filter(Boolean)
    .reverse();
  res.json({ matches });
});

// Demo helper: reset swipes/matches.
router.post('/reset', (_req, res) => {
  writeSeed();
  res.json({ ok: true });
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);
app.use('/api', router); // so the Vite dev proxy can use /api
app.listen(PORT, () => console.log(`Coy Discover API on http://localhost:${PORT}`));
