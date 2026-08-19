import { sql } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  uuid,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { EMOTION_TAGS } from '@saeteum/shared';
import { missionDraws } from './mission_draws';

export const emotionTagEnum = pgEnum('emotion_tag', EMOTION_TAGS);

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    missionDrawId: uuid('mission_draw_id')
      .notNull()
      .references(() => missionDraws.id, { onDelete: 'cascade' }),
    rating: smallint('rating'),
    photoPath: text('photo_path'),
    content: text('content'),
    emotionTags: emotionTagEnum('emotion_tags').array(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('idx_reviews_mission_draw').on(table.missionDrawId),
    check('reviews_rating_range', sql`${table.rating} BETWEEN 1 AND 5`),
    check(
      'reviews_emotion_tags_max',
      sql`array_length(${table.emotionTags}, 1) IS NULL OR array_length(${table.emotionTags}, 1) <= 3`,
    ),
    check(
      'reviews_min_one_input',
      sql`${table.rating} IS NOT NULL OR ${table.photoPath} IS NOT NULL OR ${table.content} IS NOT NULL OR array_length(${table.emotionTags}, 1) > 0`,
    ),
  ],
);
