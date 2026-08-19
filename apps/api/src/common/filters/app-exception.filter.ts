import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { type ErrorCode } from '@saeteum/shared';
import { AppException, ERROR_STATUS } from '@/common/exceptions/app.exception';

type ErrorResponse = {
  code: ErrorCode;
  message: string;
};

export const STATUS_TO_ERROR: Partial<Record<number, ErrorResponse>> = {
  [HttpStatus.BAD_REQUEST]: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request.',
  },
  [HttpStatus.UNAUTHORIZED]: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required.',
  },
  [HttpStatus.FORBIDDEN]: {
    code: 'FORBIDDEN',
    message: 'Access denied.',
  },
  [HttpStatus.NOT_FOUND]: {
    code: 'RESOURCE_NOT_FOUND',
    message: 'Resource not found.',
  },
};

export const INTERNAL_ERROR: ErrorResponse = {
  code: 'INTERNAL_ERROR',
  message: 'Internal server error.',
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AppException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof HttpException) {
      const error = STATUS_TO_ERROR[exception.getStatus()] ?? INTERNAL_ERROR;

      response.status(ERROR_STATUS[error.code]).json({
        error,
      });
      return;
    }

    this.logger.error(exception);

    response.status(ERROR_STATUS.INTERNAL_ERROR).json({
      error: INTERNAL_ERROR,
    });
  }
}
