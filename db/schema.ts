import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const registrations = sqliteTable(
  'registrations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    sessionKey: text('session_key').notNull(),
    registeredAt: text('registered_at').notNull(),
  },
  (table) => [
    uniqueIndex('registrations_session_key_unique').on(table.sessionKey),
    index('idx_registrations_registered_at').on(table.registeredAt),
  ],
);
