import { db } from '@/db';
import { providerEnum, users } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

type Provider = (typeof providerEnum.enumValues)[number];

export type User = typeof users.$inferSelect;

@Injectable()
export class UsersRepository {
  async findByProvider(
    provider: Provider,
    providerId: string,
  ): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(eq(users.provider, provider), eq(users.providerId, providerId)),
      )
      .limit(1);

    return user ?? null;
  }

  async create(input: {
    provider: Provider;
    providerId: string;
    nickname: string;
  }): Promise<User> {
    const [user] = await db.insert(users).values(input).returning();

    return user;
  }
}
