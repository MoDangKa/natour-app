import fs from 'fs';
import path from 'path';

const logsDirectory = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}

const getLogFilePath = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const logFileName = `error_${currentDate}.log`;
  return path.join(logsDirectory, logFileName);
};

export const logError = (message: string) => {
  const logFilePath = getLogFilePath();
  const timestamp = new Date().toLocaleTimeString([], {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, 'utf8');
};

export const apiLogError = (
  ip: string = '',
  method: string,
  pathname: string,
  errorMessage: string
) => {
  logError(`[${ip}] ${method} ${pathname} 400 - ${errorMessage}`);
};
