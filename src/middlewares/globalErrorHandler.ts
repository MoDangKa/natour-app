import { apiLogError } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.message ? 400 : 500;
  const status = err.message ? 'failed' : 'error';
  const errorMessage = err.message || 'Internal Server Error';

  apiLogError(req.ip, req.method, req.originalUrl, statusCode, errorMessage);
  res.status(statusCode).json({
    status,
    message: errorMessage,
  });
};

export default globalErrorHandler;
