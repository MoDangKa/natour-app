import CustomError from '@/utils/customError';
import { writeErrorLog } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const errorMiddleware = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isCustomError = err instanceof CustomError;
  const isError = err instanceof Error;

  let statusCode: number = 500;
  let status: string = 'error';
  const message: string = err.message;
  let error: Record<string, any> = {};

  if (isCustomError) {
    statusCode = err.statusCode;
    status = err.status;
    error = err.error;
    console.log('CustomError: ', err);
  }

  if (isError) {
    statusCode = (err as any)?.statusCode || 400;
    status = 'fail';
    error = (err as any)?.error || ((err as any)?.errorResponse && err) || {};
    console.log('Error: ', err);
  }

  const jsonResponse: {
    status: string;
    message: string;
    error?: any;
    stack?: any;
  } = {
    status,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    if (Object.keys(error).length > 0) {
      jsonResponse.error = error;
    }
    jsonResponse.stack = err.stack;
  }

  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);

  res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
