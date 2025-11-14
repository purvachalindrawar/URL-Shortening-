import { Pool } from 'pg';

let pool = null;

const ensurePool = () => {
  if (!pool) {
    const connStr = process.env.DATABASE_URL;
    pool = new Pool({
      connectionString: connStr,
      ssl: connStr && connStr.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
};

export const query = (text, params) => ensurePool().query(text, params);

export const initDb = async () => {
  // Create tables if they do not exist
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS short_urls (
      id SERIAL PRIMARY KEY,
      full_url TEXT NOT NULL,
      short_url TEXT UNIQUE NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
    );
  `);
};

export default { query, initDb };
