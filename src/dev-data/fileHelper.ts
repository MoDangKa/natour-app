import { promises as fs } from 'fs';
import path from 'path';

const getFilePath = (fileName: string): string => {
  return path.join(__dirname, 'data', fileName);
};

export const readFile = async <T = any>(fileName: string): Promise<T> => {
  try {
    const toursFilePath = getFilePath(fileName);
    const data = await fs.readFile(toursFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read ${fileName}`);
  }
};

export const writeFile = async <T = any>(fileName: string, data: T) => {
  try {
    const toursFilePath = getFilePath(fileName);
    const formattedTours = JSON.stringify(data, null, 2);
    await fs.writeFile(toursFilePath, formattedTours, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write ${fileName}`);
  }
};
