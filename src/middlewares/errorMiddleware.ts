import CustomError from '@/utils/customError';
import { writeErrorLog } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err?.errorResponse?.errmsg.match(/".+?"/gm)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(message, 400);
};

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = err.statusCode || 500;
  let status: string = err.status || 'error';
  let message: string = err.message;
  let customError: any = { ...err };

  if (customError?.path && customError?.value) {
    customError = handleCastErrorDB(customError);
    statusCode = customError.statusCode;
    status = customError.status;
    message = customError.message;
  }

  if (customError?.code === 11000) {
    customError = handleDuplicateFieldsDB(customError);
    statusCode = customError.statusCode;
    status = customError.status;
    message = customError.message;
  }

  const errorDetail: Record<string, any> =
    customError?.error ||
    (customError?.errors && err) ||
    (customError?.errorResponse && err) ||
    {};

  const jsonResponse: {
    status: string;
    message: string;
    error?: Record<string, any>;
    stack?: any;
  } = {
    status,
    message,
  };

  if (process.env.NODE_ENV === 'development') {
    if (Object.keys(errorDetail).length > 0) {
      jsonResponse.error = errorDetail;
    }
    jsonResponse.stack = err.stack;
  }

  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);

  res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
