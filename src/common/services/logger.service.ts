import { Logger as NestLogger } from '@nestjs/common';

export class Logger {
  private static instance: Logger;
  private nestLogger: NestLogger;

  private constructor(context?: string) {
    this.nestLogger = new NestLogger(String(context));
  }

  static getInstance(context?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(context);
    }
    return Logger.instance;
  }

  log(message: string, context?: string) {
    this.nestLogger.log(message, context);
  }

  error(message: string, trace?: string, context?: string) {
    this.nestLogger.error(message, trace, context);
  }

  warn(message: string, context?: string) {
    this.nestLogger.warn(message, context);
  }
}

export const logger = Logger.getInstance(); //TODO: Will figure out a way of tracking logs location
//TODO: will figure out a single way to handle logs across the application
