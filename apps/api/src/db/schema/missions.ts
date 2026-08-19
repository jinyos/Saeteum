import { pgEnum, pgTable, serial, text, index } from 'drizzle-orm/pg-core';
import { MISSION_CATEGORIES } from '@saeteum/shared';

export const missionCategoryEnum = pgEnum('mission_category', MISSION_CATEGORIES);

export const missions = pgTable(
  'missions',
  {
    id: serial('id').primaryKey(),
    category: missionCategoryEnum('category').notNull(),
    content: text('content').notNull(),
  },
  (table) => [index('idx_missions_category').on(table.category)],
);
