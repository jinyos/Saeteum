import {
  pgTable,
  uuid,
  integer,
  jsonb,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const insights = pgTable(
  'insights',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    milestone: integer('milestone').notNull(),
    emotionSnapshot: jsonb('emotion_snapshot'),
    narrativeSummary: text('narrative_summary'),
    categoryTendency: jsonb('category_tendency'),
    emotionTrend: jsonb('emotion_trend'),
    generatedAt: timestamp('generated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_insights_user_milestone').on(
      table.userId,
      table.milestone,
    ),
    index('idx_insights_user_milestone_desc').on(
      table.userId,
      table.milestone.desc(),
    ),
  ],
);
