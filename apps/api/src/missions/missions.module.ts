import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { MissionDrawsRepository } from './repositories/mission-draws.repository';

@Module({
  imports: [AuthModule],
  controllers: [MissionsController],
  providers: [MissionsService, MissionDrawsRepository],
})
export class MissionsModule {}
