import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, 'data', 'db.json');

const women = ['Aanya','Diya','Ishita','Meera','Kavya','Riya','Sneha','Tanvi','Naina','Pooja','Simran','Aditi','Nisha','Anika','Shreya','Mahi','Tara','Zoya'];
const men = ['Arjun','Rohan','Kabir','Vihaan','Aarav','Dev','Karan','Ishaan','Reyansh','Neil','Yash','Rahul','Aman','Veer','Samar','Ayaan','Dhruv','Kunal'];
const places = ['Delhi University','IIT Delhi','Gurgaon','Noida','Ashoka University','Christ University, Bangalore','Mumbai','Pune','Chandigarh','BITS Pilani','Jaipur','Hyderabad','Symbiosis, Pune','Ahmedabad','Kolkata','Lady Shri Ram College','SRCC, Delhi','Bangalore'];
const bios = [
  'Chai over coffee, always. Will judge your playlist.',
  'Weekend trekker, weekday overthinker.',
  'Looking for someone to split a dessert with.',
  'Can quote every Brooklyn 99 episode.',
  'Photographer by hobby, foodie by nature.',
  'Gym at 6am, memes at 6pm.',
  'Bookworm with a soft spot for road trips.',
  'Ask me about my sourdough starter.',
  'Stand-up comedy fan. Terrible dancer, great vibes.',
  'Building side projects and collecting vinyl.',
  'Will happily lose to you at Mario Kart.',
  'Fluent in sarcasm and film references.'
];
const interestPool = ['Travel','Music','Football','Cooking','Photography','Gaming','Reading','Fitness','Movies','Coding','Dance','Hiking','Art','Anime','Cricket','Podcasts','Startups','Yoga','Fashion','Standup'];

const pick = (arr, i, step = 1) => arr[(i * step) % arr.length];

export function buildSeed() {
  const profiles = [];
  for (let i = 0; i < 36; i++) {
    const female = i % 2 === 0;
    const k = Math.floor(i / 2);
    const name = female ? women[k] : men[k];
    const interests = [0, 1, 2, 3].map((j) => interestPool[(i * 3 + j * 5) % interestPool.length]);
    profiles.push({
      id: i + 1,
      name,
      age: 19 + ((i * 7) % 9),
      photo: `https://randomuser.me/api/portraits/${female ? 'women' : 'men'}/${10 + k * 3}.jpg`,
      bio: pick(bios, i, 5),
      city: pick(places, i, 7),
      interests: [...new Set(interests)],
      // SERVER-SIDE ONLY. Never sent to the client.
      likedYou: i % 5 === 2 // 7 profiles already liked the logged-in user
    });
  }
  return { profiles, swipes: [], matches: [] };
}

export function writeSeed() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(buildSeed(), null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeSeed();
  console.log('Seeded', DB_PATH);
}
