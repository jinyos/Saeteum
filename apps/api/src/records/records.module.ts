import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { StorageModule } from '@/storage/storage.module';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { RecordsRepository } from './repositories/records.repository';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [RecordsController],
  providers: [RecordsService, RecordsRepository],
})
export class RecordsModule {}
