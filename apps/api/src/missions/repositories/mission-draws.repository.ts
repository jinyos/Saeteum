import { db } from '@/db';
import { missionDraws, missions } from '@/db/schema';
import { Injectable } from '@nestjs/common';
import { and, eq, asc, count, sql } from 'drizzle-orm';

export type CandidateMission = {
  id: number;
  content: string;
};

export type DrawnMission = {
  missionDrawId: string;
  drawnAt: Date;
  mission: CandidateMission;
};

@Injectable()
export class MissionDrawsRepository {
  async findByUserAndDay(
    userId: string,
    drawnDate: string,
  ): Promise<DrawnMission | null> {
    const [row] = await db
      .select({
        missionDrawId: missionDraws.id,
        drawnAt: missionDraws.drawnAt,
        mission: {
          id: missions.id,
          content: missions.content,
        },
      })
      .from(missionDraws)
      .innerJoin(missions, eq(missionDraws.missionId, missions.id))
      .where(
        and(
          eq(missionDraws.userId, userId),
          eq(missionDraws.drawnDate, drawnDate),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  async getCandidateMission(userId: string): Promise<CandidateMission | null> {
    const drawCounts = db
      .select({
        missionId: missionDraws.missionId,
        count: count().as('count'),
      })
      .from(missionDraws)
      .where(eq(missionDraws.userId, userId))
      .groupBy(missionDraws.missionId)
      .as('draw_counts');

    const [candidate] = await db
      .select({
        id: missions.id,
        content: missions.content,
      })
      .from(missions)
      .leftJoin(drawCounts, eq(missions.id, drawCounts.missionId))
      .orderBy(asc(sql`coalesce(${drawCounts.count}, 0)`), sql`random()`)
      .limit(1);

    return candidate ?? null;
  }

  async create(input: {
    userId: string;
    missionId: number;
    drawnDate: string;
  }): Promise<{ id: string; drawnAt: Date }> {
    const [row] = await db
      .insert(missionDraws)
      .values(input)
      .returning({ id: missionDraws.id, drawnAt: missionDraws.drawnAt });

    return row;
  }
}
