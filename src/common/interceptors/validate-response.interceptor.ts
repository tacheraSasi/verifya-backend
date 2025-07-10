import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ValidationInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap(data => {
        return from(this.validateResponse(data)).pipe(
          catchError(error => {
            this.logger.error(
              `Validation failed: ${error.message}`,
              error.stack,
            );
            throw error;
          }),
        );
      }),
    );
  }

  private async validateResponse(data: any): Promise<any> {
    // Skip validation for null, undefined, or non-objects
    if (!data || typeof data !== 'object') {
      this.logger.debug('Skipping validation: data is not an object');
      return data;
    }

    if (Array.isArray(data)) {
      return await this.validateArray(data);
    }

    return await this.validateSingleObject(data);
  }

  private async validateArray(data: any[]): Promise<any[]> {
    const validatedData = [];
    const errors: Record<string, string[]>[] = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (this.isValidatable(item)) {
        const validationErrors = await validate(item);
        if (validationErrors.length > 0) {
          const errorObj: Record<string, string[]> = {};
          errorObj[`item_${i}`] = Object.values(
            this.formatErrors(validationErrors),
          ).flat();
          errors.push(errorObj);
        } else {
          validatedData.push(item);
        }
      } else {
        validatedData.push(item); // Skip non-DTO items
      }
    }

    if (errors.length > 0) {
      throw new InternalServerErrorException({
        message: 'Response validation failed for one or more items',
        errors,
      });
    }

    return validatedData;
  }

  private async validateSingleObject(data: any): Promise<any> {
    if (!this.isValidatable(data)) {
      this.logger.debug('Skipping validation: data is not a DTO');
      return data;
    }

    const errors = await validate(data);
    if (errors.length > 0) {
      throw new InternalServerErrorException({
        message: 'Response validation failed',
        errors: this.formatErrors(errors),
      });
    }

    return data;
  }

  private isValidatable(data: any): boolean {
    return (
      data &&
      data.constructor &&
      data.constructor !== Object &&
      data.constructor !== Array
    );
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    errors.forEach(error => {
      const property = error.property;
      const constraints = error.constraints || {};
      result[property] = Object.values(constraints);

      if (error.children?.length) {
        const nestedErrors = this.formatErrors(error.children);
        Object.entries(nestedErrors).forEach(([nestedProp, messages]) => {
          result[`${property}.${nestedProp}`] = messages;
        });
      }
    });

    return result;
  }
}
