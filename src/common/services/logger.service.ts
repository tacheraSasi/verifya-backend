export class Logger {
  constructor() {}

  private static instance: Logger;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(message: string) {
    console.log(message);
  }

  error(message: string) {
    console.error(message);
  }

  warn(message: string) {
    console.warn(message);
  }
}
