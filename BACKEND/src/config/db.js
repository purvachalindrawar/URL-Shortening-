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

  // Add new columns for TTL, password protection, and project relation
  await query(`ALTER TABLE short_urls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NULL;`);
  await query(`ALTER TABLE short_urls ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;`);
  await query(`ALTER TABLE short_urls ADD COLUMN IF NOT EXISTS password_hash TEXT NULL;`);
  await query(`ALTER TABLE short_urls ADD COLUMN IF NOT EXISTS project_id INTEGER NULL;`);

  // Teams / RBAC (basic)
  await query(`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('OWNER','ADMIN','MEMBER')),
      PRIMARY KEY(team_id, user_id)
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );
  `);
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_short_urls_project'
      ) THEN
        ALTER TABLE short_urls
          ADD CONSTRAINT fk_short_urls_project
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
      END IF;
    END$$;
  `);

  // Click logging table
  await query(`
    CREATE TABLE IF NOT EXISTS link_clicks (
      id SERIAL PRIMARY KEY,
      short_url_id INTEGER REFERENCES short_urls(id) ON DELETE CASCADE,
      ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ua TEXT,
      referrer TEXT,
      ip TEXT
    );
  `);

  // Helpful indices
  await query(`CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON short_urls(expires_at);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_short_urls_short_url ON short_urls(short_url);`);
};

export default { query, initDb };
