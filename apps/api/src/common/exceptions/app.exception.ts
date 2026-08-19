import { HttpException, HttpStatus } from '@nestjs/common';
import { type ErrorCode } from '@saeteum/shared';

export const ERROR_STATUS: Record<ErrorCode, HttpStatus> = {
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  RESOURCE_NOT_FOUND: HttpStatus.NOT_FOUND,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,

  INVALID_OAUTH_CODE: HttpStatus.BAD_REQUEST,
  OAUTH_PROVIDER_ERROR: HttpStatus.UNAUTHORIZED,
  INVALID_REFRESH_TOKEN: HttpStatus.UNAUTHORIZED,

  ALREADY_DRAWN_TODAY: HttpStatus.CONFLICT,
  REVIEW_CLOSED: HttpStatus.CONFLICT,
  REVIEW_ALREADY_EXISTS: HttpStatus.CONFLICT,
  REVIEW_EMPTY_INPUT: HttpStatus.BAD_REQUEST,
  REVIEW_TOO_MANY_TAGS: HttpStatus.BAD_REQUEST,
};

export class AppException extends HttpException {
  constructor(code: ErrorCode, message: string) {
    const status = ERROR_STATUS[code];

    super({ error: { code, message } }, status);
  }
}
