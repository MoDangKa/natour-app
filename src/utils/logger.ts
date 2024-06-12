import fs from 'fs';
import path from 'path';

type LogType = 'error';

const getLogFilePath = (logType?: LogType): string | null => {
  const currentDate: string = new Date().toISOString().split('T')[0];
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

export const writeLogFile = async (
  message: string,
  logType?: LogType,
): Promise<void> => {
  const logFilePath: string | null = getLogFilePath(logType);

  if (!logFilePath) {
    return;
  }

  const timestamp: string = new Date().toISOString();
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
): Promise<void> => {
  const logMessage: string = `[${ip}] ${method} ${pathname} ${stateCode} - ${errorMessage}`;
  await writeLogFile(logMessage, 'error');
};
