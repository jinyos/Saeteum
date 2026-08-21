import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { StorageModule } from '@/storage/storage.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsRepository],
})
export class ReviewsModule {}
