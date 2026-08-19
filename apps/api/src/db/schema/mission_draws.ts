import {
  pgTable,
  uuid,
  integer,
  date,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { missions } from './missions';

export const missionDraws = pgTable(
  'mission_draws',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    missionId: integer('mission_id')
      .notNull()
      .references(() => missions.id, { onDelete: 'restrict' }),
    drawnDate: date('drawn_date').notNull(),
    drawnAt: timestamp('drawn_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_mission_draws_day').on(table.userId, table.drawnDate),
    index('idx_mission_draws_user').on(table.userId),
  ],
);
