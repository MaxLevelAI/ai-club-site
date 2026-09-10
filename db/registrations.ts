import { neon } from '@neondatabase/serverless';

export type RegistrationRow = {
  id: number;
  name: string;
  student_id: string | null;
  email: string | null;
  registered_at: string;
};

// A Neon Postgres connection. The connection string comes from DATABASE_URL,
// but the Vercel/Neon integration may name it differently, so accept the
// common variants too.
function connectionString(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_PRISMA_URL ||
    undefined
  );
}

function sql() {
  const url = connectionString();
  if (!url) {
    throw new Error(
      'Registration database is unavailable. Set the DATABASE_URL environment variable to your Neon Postgres connection string.',
    );
  }
  return neon(url);
}

let schemaPromise: Promise<void> | null = null;

export function ensureRegistrationSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const db = sql();
      await db`
        CREATE TABLE IF NOT EXISTS registrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          student_id TEXT,
          email TEXT,
          session_key TEXT NOT NULL,
          registered_at TEXT NOT NULL
        )
      `;
      // Backfill columns for databases created before student_id/email existed.
      await db`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS student_id TEXT`;
      await db`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS email TEXT`;
      await db`
        CREATE UNIQUE INDEX IF NOT EXISTS registrations_session_key_unique
        ON registrations (session_key)
      `;
      await db`
        CREATE INDEX IF NOT EXISTS idx_registrations_registered_at
        ON registrations (registered_at)
      `;
    })();
  }
  return schemaPromise;
}

export async function saveRegistration(
  name: string,
  studentId: string,
  email: string,
  sessionKey: string,
) {
  await ensureRegistrationSchema();
  const db = sql();
  const inserted = await db`
    INSERT INTO registrations (name, student_id, email, session_key, registered_at)
    VALUES (${name}, ${studentId}, ${email}, ${sessionKey}, ${new Date().toISOString()})
    ON CONFLICT (session_key) DO NOTHING
    RETURNING id
  `;

  return { created: inserted.length > 0 };
}

export async function listRegistrations(): Promise<RegistrationRow[]> {
  await ensureRegistrationSchema();
  const db = sql();
  const rows = await db`
    SELECT id, name, student_id, email, registered_at
    FROM registrations
    ORDER BY registered_at DESC
  `;

  return rows as RegistrationRow[];
}

export async function countRegistrations(): Promise<number> {
  await ensureRegistrationSchema();
  const db = sql();
  const rows = await db`SELECT COUNT(*)::int AS count FROM registrations`;

  return Number((rows[0] as { count?: number } | undefined)?.count ?? 0);
}
