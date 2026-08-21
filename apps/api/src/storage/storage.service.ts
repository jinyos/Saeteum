import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { SECONDS_PER_MINUTE } from '@saeteum/shared';
import { AppException } from '@/common/exceptions/app.exception';
import { supabaseStorage } from './storage.client';

const REVIEW_PHOTOS_BUCKET = 'review-photos';
const SIGNED_URL_TTL_SECONDS = SECONDS_PER_MINUTE;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async createUploadUrl(
    userId: string,
  ): Promise<{ uploadUrl: string; photoPath: string }> {
    const photoPath = `${userId}/${randomUUID()}.jpg`;

    const { data, error } = await supabaseStorage
      .from(REVIEW_PHOTOS_BUCKET)
      .createSignedUploadUrl(photoPath);

    if (error) {
      this.logger.error(`Failed to create upload URL: ${error.message}`);
      throw new AppException(
        'INTERNAL_ERROR',
        'Failed to create upload URL.',
      );
    }

    return { uploadUrl: data.signedUrl, photoPath };
  }

  async createReadUrl(photoPath: string): Promise<string> {
    const { data, error } = await supabaseStorage
      .from(REVIEW_PHOTOS_BUCKET)
      .createSignedUrl(photoPath, SIGNED_URL_TTL_SECONDS);

    if (error) {
      this.logger.error(`Failed to create signed URL: ${error.message}`);
      throw new AppException(
        'INTERNAL_ERROR',
        'Failed to create signed URL.',
      );
    }

    return data.signedUrl;
  }

  async deleteObject(photoPath: string): Promise<void> {
    const { error } = await supabaseStorage
      .from(REVIEW_PHOTOS_BUCKET)
      .remove([photoPath]);

    if (error) {
      this.logger.error(
        `Failed to delete storage object ${photoPath}: ${error.message}`,
      );
    }
  }

  async deleteAllForUser(userId: string): Promise<void> {
    const { data, error: listError } = await supabaseStorage
      .from(REVIEW_PHOTOS_BUCKET)
      .list(userId);

    if (listError) {
      this.logger.error(
        `Failed to list storage objects for user ${userId}: ${listError.message}`,
      );
      return;
    }

    if (!data.length) {
      return;
    }

    const paths = data.map((file) => `${userId}/${file.name}`);
    const { error } = await supabaseStorage
      .from(REVIEW_PHOTOS_BUCKET)
      .remove(paths);

    if (error) {
      this.logger.error(
        `Failed to delete storage objects for user ${userId}: ${error.message}`,
      );
    }
  }
}
