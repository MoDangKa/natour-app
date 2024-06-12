import fs from 'fs';
import path from 'path';

const getLogFilePath = (folder: string = ''): string | null => {
  const currentDate: string = new Date().toISOString().split('T')[0];
  const logFileName: string = `error_${currentDate}.log`;
  const logsDirectory: string = path.join(__dirname, '../logs', folder);

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

export const writeLogFile = async (message: string): Promise<void> => {
  const logFilePath: string | null = getLogFilePath('errors');

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
  await writeLogFile(logMessage);
};
