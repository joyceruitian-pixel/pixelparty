import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
// Only a shared daily request count is saved. No chat text or visitor identifiers.
export const aiUsage = sqliteTable('ai_usage', {
  day: text('day').primaryKey(),
  requests: integer('requests').notNull().default(0),
});
