# Coy – Discover tab

A swipe-based discovery feature (Bumble/Tinder style) built as a standalone app for the Coy SDE Intern assignment.

**Stack:** React (Vite) + Framer Motion · Node.js + Express · JSON file storage.

## Run it

```bash
npm run install:all   # installs root, server and client deps
npm run dev           # API on :4000, web on http://localhost:5173
```

Open http://localhost:5173 on desktop (use the buttons or drag with the mouse) or on a phone on the same network (drag gestures).
The database (`server/data/db.json`) is created and seeded automatically on first start. Re-seed with `npm run seed`, or use "Reset demo data" on the empty-state screen.

## Features
- Home tab (intentionally blank) and Discover tab
- 36 seeded profiles (name, age, photo, bio, city/college, interests)
- 7 seeded profiles have already liked you, so matches happen quickly in a demo
- Drag-to-swipe with LIKE / NOPE stamps, rotation and fling animation; buttons for desktop
- "It's a match!" screen, a Matches view with a badge count, and an empty state when the deck is finished
- Swipes and matches persist across reloads

## API

| Method | Path | Description |
|---|---|---|
| GET | `/feed` | Profiles not yet swiped on |
| POST | `/swipe` | Body `{ "profileId": 3, "action": "like" \| "pass" }`. Returns `{ "match": false }` or `{ "match": true, "profile": {...} }` |
| GET | `/matches` | Mutual matches only |
| POST | `/reset` | Demo helper, re-seeds the data |

(Also available under `/api/*`, which the Vite dev proxy uses.)

## Privacy: the core promise
- `likedYou` lives only in the server's JSON file. Every response is built through a `publicProfile()` allow-list that omits it.
- `/swipe` returns `{ match: false }` for both a pass and a like that didn't match, so the response can't be used to infer who liked you.
- A match is created only when you like someone who already liked you.
- There is deliberately no "who liked you" screen, count or endpoint.
- A profile can only be swiped once (`409` otherwise), and `/feed` excludes anything swiped, so nobody reappears.

## Project layout
```
server/  index.js (Express API), seed.js (mock data), data/db.json (generated)
client/  src/App.jsx, components/{Discover,SwipeCard,MatchModal,Matches}.jsx, api.js, styles.css
```

---

## Part A: two core features I'd add to Coy

### 1. Crush snooze and auto-expiry
**What:** Every crush gets a quiet "freshness" timer. After a set period (say 30 or 60 days) the app asks "Still thinking about them?" and the user can keep, snooze or archive the crush. Archiving frees up the slot.

**Why it's needed:**
- Feelings fade, but a crush stays in the list until the user manually removes it. A stale crush is a stale secret, which makes the list feel heavier over time.
- Slots are limited and the extra-slots screen sells more of them. Letting people free a slot themselves is a fairer way to retain users than making them pay to make room for someone new, and it keeps the list honest and current.
- It also improves match quality. A match with someone you stopped caring about weeks ago is a worse experience than no match.
- Privacy impact is none: the timer only runs on the user's own data and tells the other person nothing.

*(while i added my crush i noticed we can add how it's our crush or how we met so it get some clue to them.)*

### 2. "Verified" badge on matches, built from the existing verification flow
**What:** Coy already collects a verified phone number (OTP) and an email. Use that to show a small "Verified" badge on the match screen, and only after a mutual match. Optionally, verify a college or work email domain so a match can also show "Both from the same college".

**Why it's needed:**
- Coy's promise is trust: users type in a real person's name and hope it stays private. Fake or throwaway accounts are the biggest threat to that trust.
- The signal is nearly free to build, because the OTP and email verification steps already exist. It only needs a flag and a badge.
- Showing it only after a match keeps the core promise intact. Nobody learns anything about anyone who hasn't liked them back.
- It gives the invite-link flow a better pitch: "Join, verify, and your crush will know you're real."

*(i loggin by my phone no it's very smooth process and add crush is very simple)*

---

## Notes for reviewers
- Storage is a JSON file for simplicity. For production I'd move to SQLite/Postgres with a `swipes(user_id, profile_id)` unique constraint to enforce "never swiped twice" at the database level.
- Auth is out of scope per the brief, so there is a single implicit logged-in user.