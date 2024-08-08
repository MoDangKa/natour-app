import { Request } from 'express';
import fs from 'fs';
import moment from 'moment';
import path from 'path';
import { createLogger, format, transports } from 'winston';

type LogType = 'error';

const currentDate: string = moment().format('YYYY-MM-DD');

const getLogFilePath = (logType?: LogType): string | null => {
  let logFileName: string;
  let logsDirectory: string;

  if (logType) {
    logFileName = `${logType}_${currentDate}.log`;
    logsDirectory = path.join(__dirname, '../logs', `${logType}s`);
  } else {
    logFileName = `log_${currentDate}.log`;
    logsDirectory = path.join(__dirname, '../logs');
  }

  try {
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory, { recursive: true });
    }
  } catch (error: any) {
    console.error(`Error creating logs directory: ${error.message}`);
    return null;
  }

  return path.join(logsDirectory, logFileName);
};

export const writeLogFile = async (message: string, logType?: LogType) => {
  const logFilePath: string | null = getLogFilePath(logType);

  if (!logFilePath) {
    return;
  }

  const timestamp: string = moment().format('YYYY-MM-DD HH:mm:ss');
  const logMessage: string = `${timestamp} - ${message}\n`;

  try {
    await fs.promises.appendFile(logFilePath, logMessage, 'utf8');
  } catch (error: any) {
    console.error(`Error writing to log file: ${error.message}`);
  }
};

export const writeErrorLog = async (
  ip: string = '',
  method: string,
  pathname: string,
  stateCode: number,
  errorMessage: string,
) => {
  const logMessage: string = `[${ip}] ${method} ${pathname} ${stateCode} - ${errorMessage}`;
  await writeLogFile(logMessage, 'error');
};

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({
      filename: path.join(__dirname, '../logs', currentDate, 'error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(__dirname, '../logs', currentDate, 'combined.log'),
    }),
  ],
});

export const writeLog = (req: Request, statusCode: number, message: string) => {
  const msg = `[${req.ip}] ${req.method} ${req.originalUrl} ${statusCode} : ${message}`;
  logger.info(msg);
};
