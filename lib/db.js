// A tiny JSON-file database so the project runs with zero setup.
// All writes go through `mutate`, which is serialised to avoid lost updates.
// To go to production, replace this file with Prisma/Postgres/MongoDB – the rest of the app only uses these functions.
import { promises as fs } from "fs";
import path from "path";
import { buildSeed } from "./seed";

const FILE = path.join(process.cwd(), "data", "db.json");
let queue = Promise.resolve();

async function load() {
  try {
    const db = JSON.parse(await fs.readFile(FILE, "utf8"));
    db.orders ||= []; // older data files predate payments
    return db;
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    const seed = buildSeed();
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
}

export const readDb = () => load();

/** Run `fn(db)` exclusively, then persist the (mutated) db atomically. */
export function mutate(fn) {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await fs.writeFile(`${FILE}.tmp`, JSON.stringify(db, null, 2));
    await fs.rename(`${FILE}.tmp`, FILE);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
