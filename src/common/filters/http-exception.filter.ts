import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface for standardized error responses
 */
export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path: string;
  error: string | Record<string, any>;
  stack?: string;
}

/**
 * Global HTTP exception filter
 * Catches all exceptions and formats them into a standardized response
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let error: string | Record<string, any> = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).errors || exception.message;
      } else {
        message = exception.message;
        error = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse: ErrorResponse = {
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
    };

    if (process.env.NODE_ENV !== 'production' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}
