import fs from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export class Logger {
  private logLevel: LogLevel;
  private logFile: string;

  constructor(level: string = 'info', logFile: string = 'trading.log') {
    this.logLevel = this.parseLogLevel(level);
    this.logFile = logFile;
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}`;
  }

  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const formatted = this.formatMessage('debug', message, data);
      console.log(formatted);
      this.writeToFile(formatted);
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const formatted = this.formatMessage('info', message, data);
      console.log(formatted);
      this.writeToFile(formatted);
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const formatted = this.formatMessage('warn', message, data);
      console.warn(formatted);
      this.writeToFile(formatted);
    }
  }

  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const formatted = this.formatMessage('error', message, data);
      console.error(formatted);
      this.writeToFile(formatted);
    }
  }

  trade(message: string, tradeData?: any): void {
    const timestamp = new Date().toISOString();
    const dataStr = tradeData ? ` | ${JSON.stringify(tradeData)}` : '';
    const formatted = `[${timestamp}] [TRADE] ${message}${dataStr}`;
    console.log(formatted);
    this.writeToFile(formatted);
  }

  balance(message: string, balanceData?: any): void {
    const timestamp = new Date().toISOString();
    const dataStr = balanceData ? ` | ${JSON.stringify(balanceData)}` : '';
    const formatted = `[${timestamp}] [BALANCE] ${message}${dataStr}`;
    console.log(formatted);
    this.writeToFile(formatted);
  }
}

// Export singleton instance
export const logger = new Logger(process.env.LOG_LEVEL || 'info');
