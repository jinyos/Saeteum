import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: '후기 작성' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @ApiOperation({ summary: '후기 사진 업로드 URL 발급' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('photos')
  createPhotoUploadUrl(@CurrentUser() user: { id: string }) {
    return this.reviewsService.createPhotoUploadUrl(user.id);
  }

  @ApiOperation({ summary: '후기 단건 조회' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':missionDrawId')
  getDetail(
    @CurrentUser() user: { id: string },
    @Param('missionDrawId') missionDrawId: string,
  ) {
    return this.reviewsService.getDetail(user.id, missionDrawId);
  }

  @ApiOperation({ summary: '후기 삭제' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.reviewsService.delete(user.id, id);
  }
}
