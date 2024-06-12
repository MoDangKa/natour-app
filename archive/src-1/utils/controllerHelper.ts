import { Request, Response } from 'express';
import { LogError } from './logger';

export const handleApiError = (
  req: Request,
  res: Response,
  statusCode: number,
  errorMessage: string,
) => {
  LogError(req.ip, req.method, req.originalUrl, statusCode, errorMessage);
  res.status(statusCode).json({ status: 'failed', message: errorMessage });
};
