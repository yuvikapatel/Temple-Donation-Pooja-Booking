// Realistic starter data. Created automatically the first time the app runs.
import { makeId } from "./ids";
import { addDays, todayIST } from "./format";

export const SEED_PACKAGES = [
  { id: "annadanam-100", title: "Feed 100 devotees", description: "Sponsor a hot, freshly cooked meal for 100 pilgrims in the temple dining hall.", category: "Annadanam", icon: "🍚", amount: 2500, allowCustom: false, min: 0, goal: 0, featured: true, active: true },
  { id: "annadanam-full-day", title: "Full-day Annadanam", description: "Host breakfast, lunch and dinner for the day of your choice, with your name read at the sankalpam.", category: "Annadanam", icon: "🍛", amount: 15001, allowCustom: false, min: 0, goal: 0, featured: false, active: true },
  { id: "akhanda-deepam", title: "Akhanda Deepam", description: "A lamp kept burning before the sanctum for one month in your family's name.", category: "Seva", icon: "🪔", amount: 1101, allowCustom: false, min: 0, goal: 0, featured: true, active: true },
  { id: "abhishekam-sponsor", title: "Abhishekam sponsorship", description: "Sponsor the milk, honey and flowers for a morning abhishekam to the presiding deity.", category: "Seva", icon: "🌸", amount: 2101, allowCustom: false, min: 0, goal: 0, featured: false, active: true },
  { id: "gau-seva", title: "Gau Seva", description: "Fodder, medicine and shelter for the 60 cows cared for in the temple goshala.", category: "Seva", icon: "🐄", amount: 501, allowCustom: true, min: 101, goal: 150000, featured: true, active: true },
  { id: "brahmotsavam-fund", title: "Annual festival fund", description: "Help us decorate, light and host the nine-day annual festival for over 40,000 devotees.", category: "Festival", icon: "🎊", amount: 1001, allowCustom: true, min: 501, goal: 500000, featured: true, active: true },
  { id: "gopuram-restoration", title: "Gopuram restoration", description: "Stone repair, lime plaster and hand painting for the eastern gateway tower.", category: "Temple care", icon: "🛕", amount: 5001, allowCustom: true, min: 1001, goal: 2500000, featured: false, active: true },
  { id: "pathshala-support", title: "Vedic pathshala support", description: "Books, meals and a stipend for a student of the temple's Vedic school for one term.", category: "Education", icon: "📿", amount: 3001, allowCustom: false, min: 0, goal: 0, featured: false, active: true },
];

export const SEED_POOJAS = [
  { id: "archana", title: "Archana", description: "Chanting of the deity's names with your name and gotra, ending with prasad.", price: 251, duration: 30, icon: "🌼", capacity: 8, slots: ["06:30", "08:00", "10:00", "17:30"] },
  { id: "abhishekam", title: "Abhishekam", description: "Ritual bathing of the deity with milk, curd, honey and sandal paste.", price: 1501, duration: 60, icon: "🪔", capacity: 4, slots: ["07:00", "09:00", "18:00"] },
  { id: "satyanarayana", title: "Satyanarayana Katha", description: "The full vrata with katha and havan, ideal for housewarmings and anniversaries.", price: 2501, duration: 90, icon: "📿", capacity: 3, slots: ["09:00", "16:00"] },
  { id: "sahasranama", title: "Sahasranama Archana", description: "All 1,008 names chanted by our priests, with a family sankalpam.", price: 751, duration: 45, icon: "🕉️", capacity: 5, slots: ["06:00", "11:00", "17:00"] },
  { id: "navagraha", title: "Navagraha Shanti", description: "A homa for the nine planetary deities to ease difficult periods.", price: 1101, duration: 75, icon: "☀️", capacity: 3, slots: ["08:00", "12:00"] },
  { id: "vahana", title: "Vahana Pooja", description: "Blessing for a new vehicle, with a coconut offering and kumkum.", price: 501, duration: 20, icon: "🚗", capacity: 6, slots: ["07:30", "09:30", "11:30", "16:30"] },
];

const NAMES = ["Anjali Sharma", "Rohan Mehta", "Priya Nair", "Vikram Singh", "Kavita Iyer", "Arjun Reddy", "Sunita Verma", "Manoj Kulkarni", "Deepa Menon", "Harpreet Kaur", "Suresh Pillai", "Neha Gupta", "Ramesh Joshi", "Lakshmi Narayanan", "Amit Desai", "Pooja Bhatt", "Karthik Subramanian", "Meera Patel"];
const SLOT_PAIRS = [["archana", "08:00"], ["abhishekam", "07:00"], ["vahana", "09:30"], ["satyanarayana", "09:00"], ["sahasranama", "06:00"], ["navagraha", "12:00"], ["archana", "17:30"], ["abhishekam", "18:00"], ["vahana", "07:30"], ["archana", "10:00"]];

export function buildSeed() {
  const now = Date.now();
  const today = todayIST();
  const contact = (n, i) => ({
    name: n,
    phone: `98${String(76540000 + i * 1317).slice(0, 8)}`,
    email: `${n.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
  });
  const amounts = [501, 1101, 2500, 251, 5001, 1001, 2101];

  const donations = NAMES.map((n, i) => {
    const pkg = SEED_PACKAGES[i % SEED_PACKAGES.length];
    const createdAt = new Date(now - (i * 0.9 + 0.15) * 864e5);
    return {
      id: makeId("DN", createdAt),
      packageId: pkg.id,
      packageTitle: pkg.title,
      ...contact(n, i),
      amount: pkg.allowCustom ? Math.max(pkg.min, amounts[i % amounts.length]) : pkg.amount,
      method: ["UPI", "UPI", "Card", "Net banking"][i % 4],
      message: i % 4 === 0 ? "In memory of my grandmother." : "",
      anonymous: i % 6 === 5,
      status: "paid",
      createdAt: createdAt.toISOString(),
    };
  });

  const bookings = SLOT_PAIRS.map(([poojaId, slot], i) => {
    const pooja = SEED_POOJAS.find((p) => p.id === poojaId);
    const offset = i - 3; // a few past, mostly upcoming
    const date = addDays(today, offset);
    const createdAt = new Date(now - (i * 0.7 + 0.3) * 864e5);
    return {
      id: makeId("BK", createdAt),
      poojaId,
      poojaTitle: pooja.title,
      ...contact(NAMES[(i * 3 + 2) % NAMES.length], i + 20),
      date,
      slot,
      devotees: (i % 4) + 1,
      gotra: ["Kashyapa", "Bharadwaja", "Vasishtha", "Atri", ""][i % 5],
      note: "",
      amount: pooja.price,
      status: offset < 0 ? "completed" : i === 5 ? "pending" : "confirmed",
      createdAt: createdAt.toISOString(),
    };
  });

  return { packages: SEED_PACKAGES, poojas: SEED_POOJAS, donations, bookings, orders: [] };
}
