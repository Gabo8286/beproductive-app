/**
 * Centralized error logging utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);

    // Console logging
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.debug(formattedMessage, error);
        }
        break;
      case 'info':
        console.info(formattedMessage, error);
        break;
      case 'warn':
        console.warn(formattedMessage, error);
        break;
      case 'error':
      case 'fatal':
        console.error(formattedMessage, error);
        break;
    }

    // Send to backend in production
    if (!this.isDevelopment && (level === 'error' || level === 'fatal')) {
      this.sendToBackend(level, message, error, context);
    }
  }

  private async sendToBackend(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ) {
    try {
      await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          error: error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : undefined,
          context,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (logError) {
      console.error('Failed to send log to backend:', logError);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  warn(message: string, error?: Error, context?: LogContext) {
    this.log('warn', message, error, context);
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, error, context);
  }

  fatal(message: string, error?: Error, context?: LogContext) {
    this.log('fatal', message, error, context);
  }
}

export const logger = new Logger();
