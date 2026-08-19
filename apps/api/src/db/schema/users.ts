import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const providerEnum = pgEnum('provider', ['google', 'kakao', 'naver']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nickname: varchar('nickname', { length: 30 }).notNull(),
    provider: providerEnum('provider').notNull(),
    providerId: varchar('provider_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_users_provider').on(table.provider, table.providerId),
  ],
);
