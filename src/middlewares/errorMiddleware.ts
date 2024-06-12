import CustomError from '@/utils/customError';
import { apiLogError } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const errorMiddleware = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const customError = err instanceof CustomError ? err : null;
  const statusCode = customError?.statusCode ?? 500;
  const status = customError?.status ?? 'error';
  const errorMessage = err.message ?? 'Internal Server Error';
  const errorDetails = customError?.errors ?? {};

  const jsonResponse: { status: string; message: string; error?: any } = {
    status,
    message: errorMessage,
  };

  if (Object.keys(errorDetails).length > 0) {
    jsonResponse.error = errorDetails;
  }

  apiLogError(req.ip, req.method, req.originalUrl, statusCode, errorMessage);

  res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
