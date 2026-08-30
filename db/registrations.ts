import { env } from 'cloudflare:workers';

export type RegistrationRow = {
  id: number;
  name: string;
  registered_at: string;
};

let schemaPromise: Promise<void> | null = null;

function database() {
  if (!env.DB) {
    throw new Error('Registration database is unavailable.');
  }
  return env.DB;
}

export function ensureRegistrationSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = database();
      await db.batch([
        db.prepare(`
          CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            session_key TEXT NOT NULL,
            registered_at TEXT NOT NULL
          )
        `),
        db.prepare(`
          CREATE UNIQUE INDEX IF NOT EXISTS registrations_session_key_unique
          ON registrations (session_key)
        `),
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_registrations_registered_at
          ON registrations (registered_at)
        `),
      ]);
      await db.prepare('PRAGMA optimize').run();
    })();
  }
  return schemaPromise;
}

export async function saveRegistration(name: string, sessionKey: string) {
  await ensureRegistrationSchema();
  const result = await database()
    .prepare(
      `INSERT OR IGNORE INTO registrations (name, session_key, registered_at)
       VALUES (?, ?, ?)`,
    )
    .bind(name, sessionKey, new Date().toISOString())
    .run();

  return { created: (result.meta.changes ?? 0) > 0 };
}

export async function listRegistrations() {
  await ensureRegistrationSchema();
  const result = await database()
    .prepare(
      `SELECT id, name, registered_at
       FROM registrations
       ORDER BY registered_at DESC`,
    )
    .all<RegistrationRow>();

  return result.results ?? [];
}
