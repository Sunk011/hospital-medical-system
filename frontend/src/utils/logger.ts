/**
 * Frontend Logger Utility
 *
 * Provides structured logging for the frontend application.
 * In production, errors can be sent to a monitoring service.
 * In development, logs are output to the console.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const isDevelopment = import.meta.env.DEV;

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
}

/**
 * Create a log entry
 */
function createLogEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

/**
 * Output log to appropriate destination
 */
function outputLog(entry: LogEntry): void {
  // In production, you could send to a monitoring service like Sentry
  // For now, we only log in development mode
  if (isDevelopment) {
    const formattedMessage = formatLogEntry(entry);

    switch (entry.level) {
      case 'debug':
        // Debug logs only in development
        if (entry.data !== undefined) {
          // eslint-disable-next-line no-console
          console.debug(formattedMessage, entry.data);
        } else {
          // eslint-disable-next-line no-console
          console.debug(formattedMessage);
        }
        break;
      case 'info':
        if (entry.data !== undefined) {
          // eslint-disable-next-line no-console
          console.info(formattedMessage, entry.data);
        } else {
          // eslint-disable-next-line no-console
          console.info(formattedMessage);
        }
        break;
      case 'warn':
        if (entry.data !== undefined) {
          // eslint-disable-next-line no-console
          console.warn(formattedMessage, entry.data);
        } else {
          // eslint-disable-next-line no-console
          console.warn(formattedMessage);
        }
        break;
      case 'error':
        if (entry.data !== undefined) {
          // eslint-disable-next-line no-console
          console.error(formattedMessage, entry.data);
        } else {
          // eslint-disable-next-line no-console
          console.error(formattedMessage);
        }
        break;
    }
  }
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
  debug(message: string, data?: unknown): void {
    outputLog(createLogEntry('debug', message, data));
  },

  info(message: string, data?: unknown): void {
    outputLog(createLogEntry('info', message, data));
  },

  warn(message: string, data?: unknown): void {
    outputLog(createLogEntry('warn', message, data));
  },

  error(message: string, data?: unknown): void {
    outputLog(createLogEntry('error', message, data));
  },
};

export default logger;
