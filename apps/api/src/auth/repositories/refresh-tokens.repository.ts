import { db } from '@/db';
import { refreshTokens } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

type RefreshToken = typeof refreshTokens.$inferSelect;

@Injectable()
export class RefreshTokensRepository {
  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await db.insert(refreshTokens).values(input);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return row ?? null;
  }

  async rotate(
    id: string,
    currentTokenHash: string,
    input: { tokenHash: string; expiresAt: Date },
  ): Promise<boolean> {
    const [row] = await db
      .update(refreshTokens)
      .set(input)
      .where(
        and(
          eq(refreshTokens.id, id),
          eq(refreshTokens.tokenHash, currentTokenHash),
        ),
      )
      .returning({ id: refreshTokens.id });

    return row !== undefined;
  }

  async deleteByUserAndHash(userId: string, tokenHash: string): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.tokenHash, tokenHash),
        ),
      );
  }
}
