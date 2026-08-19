import { pgEnum, pgTable, serial, text, index } from 'drizzle-orm/pg-core';

export const missionCategoryEnum = pgEnum('mission_category', [
  'nature',
  'exploration',
  'connection',
  'solitude',
  'movement',
  'creation',
  'sensation',
  'declutter',
]);

export const missions = pgTable(
  'missions',
  {
    id: serial('id').primaryKey(),
    category: missionCategoryEnum('category').notNull(),
    content: text('content').notNull(),
  },
  (table) => [index('idx_missions_category').on(table.category)],
);
