import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Set timeout to 10 seconds
    return next.handle().pipe(
      timeout(10000),
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(
            () =>
              new RequestTimeoutException('Request processing took too long'),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
