import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

interface LogRequest {
  ip?: string;
  method: string;
  originalUrl: string;
}

enum LogLevel {
  Info = 'info',
  Error = 'error',
}

const getFilePath = (level: LogLevel): string | null => {
  const currentDate: string = moment().format('YYYY-MM-DD');
  const logFileName: string = `${level}_${currentDate}.log`;
  const logsDirectory: string = path.join(__dirname, '../logs', `${level}s`);

  try {
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory, { recursive: true });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error creating logs directory: ${error.message}`);
    } else {
      console.error(`An unknown error occurred while creating logs directory`);
    }
    return null;
  }

  return path.join(logsDirectory, logFileName);
};

export const writeFile = async (
  message: string,
  level: LogLevel = LogLevel.Info,
) => {
  const logFilePath: string | null = getFilePath(level);
  if (!logFilePath) return;

  const timestamp: string = moment().format('YYYY-MM-DD HH:mm:ss');
  const logMessage: string = `${level.toUpperCase()}: ${timestamp} - ${message}\n`;

  try {
    await fs.promises.appendFile(logFilePath, logMessage, 'utf8');
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error writing to log file: ${error.message}`);
    } else {
      console.error(`An unknown error occurred while writing to log file`);
    }
    throw error; // Re-throw the error if you want to propagate it
  }
};

export const recordLog = async (
  req: LogRequest,
  statusCode: number,
  message: string,
  level: LogLevel = LogLevel.Info,
) => {
  let msg: string = req.ip ? `[${req.ip}] ` : '';
  msg += `${req.method} ${req.originalUrl} ${statusCode} - ${message}`;
  await writeFile(msg, level);
};

const transport = (level: LogLevel = LogLevel.Info) =>
  new DailyRotateFile({
    level,
    filename: path.join(
      __dirname,
      '../logs',
      `${level}s`,
      `${level}_%DATE%.log`,
    ),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    // maxFiles: 14, // Limit to 14 files
  });

export const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf(
      (info) =>
        `${info.level.toUpperCase()}: ${info.timestamp} - ${info.message}`,
    ),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [transport(LogLevel.Info), transport(LogLevel.Error)],
});

export const log = (message: string, level: LogLevel = LogLevel.Info) => {
  switch (level) {
    case LogLevel.Error:
      logger.error(message);
      break;
    default:
      logger.info(message);
  }
};

export const recordLog2 = (
  req: LogRequest,
  statusCode: number,
  message: string,
) => {
  let msg: string = req.ip ? `[${req.ip}] ` : '';
  msg += `${req.method} ${req.originalUrl} ${statusCode} - ${message}`;
  log(msg);
};
