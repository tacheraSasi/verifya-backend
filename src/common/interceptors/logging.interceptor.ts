import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = request.user?.id || 'anonymous';

    this.logger.log(
      `[REQUEST] ${method} ${url} - User: ${userId} - IP: ${ip} - Agent: ${userAgent}`,
    );

    if (Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    if (Object.keys(query).length > 0) {
      this.logger.debug(`Request Query: ${JSON.stringify(query)}`);
    }

    if (Object.keys(params).length > 0) {
      this.logger.debug(`Request Params: ${JSON.stringify(params)}`);
    }

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: data => {
          const response = context.switchToHttp().getResponse();
          const latency = Date.now() - now;

          this.logger.log(
            `[RESPONSE] ${method} ${url} - Status: ${response.statusCode} - Latency: ${latency}ms`,
          );

          if (data) {
            this.logger.debug(
              `Response Data: ${JSON.stringify(data).substring(0, 500)}...`,
            );
          }
        },
        error: error => {
          const latency = Date.now() - now;

          this.logger.error(
            `[ERROR] ${method} ${url} - Status: ${error.status} - Latency: ${latency}ms - Message: ${error.message}`,
          );
        },
      }),
    );
  }
}
