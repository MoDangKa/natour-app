import { apiLogError } from '@/utils/logger';
import { Request, Response } from 'express';

const apiErrorHandler = (
  req: Request,
  res: Response,
  statusCode: number,
  errorMessage: string,
) => {
  apiLogError(req.ip, req.method, req.originalUrl, statusCode, errorMessage);
  res.status(statusCode).json({
    status: 'failed',
    message: errorMessage,
  });
};

export default apiErrorHandler;
