import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { MissionsModule } from './missions/missions.module';
import { RecordsModule } from './records/records.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    MeModule,
    MissionsModule,
    ReviewsModule,
    RecordsModule,
    StatsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
