import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import chalk from 'chalk';

const { combine, timestamp, label, printf, colorize, errors } = format;

// Custom colorized format for console output
const consoleFormat = printf(info => {
  const level = String(info.level || 'info');
  const message = String(info.message || '');
  const logLabel = String(info.label || 'APP');
  const logTimestamp = info.timestamp;
  const stack = info.stack ? String(info.stack) : undefined;

  // Ensure timestamp is properly typed
  const timestampValue = logTimestamp || new Date();
  const date =
    typeof timestampValue === 'string' || typeof timestampValue === 'number'
      ? new Date(timestampValue)
      : timestampValue instanceof Date
        ? timestampValue
        : new Date();

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: 'UTC',
  });
  const formattedDate = date.toLocaleDateString('en-GB');

  // Color mapping for different log levels
  const levelColors = {
    error: chalk.red.bold,
    warn: chalk.yellow.bold,
    info: chalk.blue.bold,
    debug: chalk.magenta.bold,
    verbose: chalk.cyan.bold,
    silly: chalk.gray.bold,
  };

  const coloredLevel =
    levelColors[level as keyof typeof levelColors] || chalk.white.bold;
  const coloredLabel = chalk.green.bold(`[${logLabel}]`);
  const coloredTime = chalk.gray(`${formattedDate} ${formattedTime}`);

  // Handle error stack traces
  const messageContent = stack ? `${message}\n${chalk.red(stack)}` : message;

  return `${coloredTime} ${coloredLabel} ${coloredLevel(level.toUpperCase())}: ${messageContent}`;
});

// File format without colors
const fileFormat = printf(info => {
  const level = String(info.level || 'info');
  const message = String(info.message || '');
  const logLabel = String(info.label || 'APP');
  const logTimestamp = info.timestamp;
  const stack = info.stack ? String(info.stack) : undefined;

  // Ensure timestamp is properly typed
  const timestampValue = logTimestamp || new Date();
  const date =
    typeof timestampValue === 'string' || typeof timestampValue === 'number'
      ? new Date(timestampValue)
      : timestampValue instanceof Date
        ? timestampValue
        : new Date();

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: 'UTC',
  });
  const formattedDate = date.toLocaleDateString('en-GB');

  const messageContent = stack ? `${message}\n${stack}` : message;

  return `${formattedDate} ${formattedTime} [${logLabel}] ${level.toUpperCase()}: ${messageContent}`;
});

// Common log directory
const LOG_DIR = path.join(process.cwd(), 'logs');

// Success/Info logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    label({ label: 'nrb-nayon' }),
    timestamp(),
  ),
  transports: [
    // Console transport with colors
    new transports.Console({
      format: combine(consoleFormat),
      handleExceptions: true,
      handleRejections: true,
    }),

    // File transport for success logs
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'success', '%DATE%-success.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '7d',
      format: combine(fileFormat),
      level: 'info',
      handleExceptions: false,
    }),

    // Combined logs file
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined', '%DATE%-combined.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '30d',
      format: combine(fileFormat),
    }),
  ],
  exitOnError: false,
});

// Error logger
const errorLogger = createLogger({
  level: 'error',
  format: combine(
    errors({ stack: true }),
    label({ label: 'nrb-nayon' }),
    timestamp(),
  ),
  transports: [
    // Console transport with colors for errors
    new transports.Console({
      format: combine(consoleFormat),
      level: 'error',
      handleExceptions: true,
      handleRejections: true,
    }),

    // File transport for error logs
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error', '%DATE%-error.log'),
      datePattern: 'YYYY-MM-DD-HH',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(fileFormat),
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Add stream for Morgan HTTP logging (optional)
logger.stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
} as any;

// Helper functions for structured logging
export const logInfo = (message: string, meta?: object) => {
  logger.info(message, meta);
};

export const logError = (message: string, error?: Error | object) => {
  if (error instanceof Error) {
    errorLogger.error(message, { error: error.message, stack: error.stack });
  } else {
    errorLogger.error(message, error);
  }
};

export const logWarn = (message: string, meta?: object) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: object) => {
  logger.debug(message, meta);
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', error => {
  errorLogger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  errorLogger.error('Unhandled Rejection at:', { promise, reason });
});

export { logger, errorLogger };
