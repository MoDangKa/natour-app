import { NODE_ENV } from '@/config';
import CustomError from '@/utils/customError';
import { writeErrorLog } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const handleCastErrorDB = (err: any) => {
  const errorMessage = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(errorMessage, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err?.errorResponse?.errmsg.match(/".+?"/gm)[0];
  const errorMessage = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(errorMessage, 400);
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

  const errorDetail: Record<string, any> =
    (err as any)?.error ||
    ((err as any)?.errors && err) ||
    ((err as any)?.errorResponse && err) ||
    {};

  let customError: any;

  if (errorDetail?.path && errorDetail?.value) {
    console.log('first');
    customError = handleCastErrorDB(errorDetail);
    statusCode = customError.statusCode;
    status = customError.status;
    message = customError.message;
  }

  if (errorDetail?.code === 11000) {
    console.log('second');
    customError = handleDuplicateFieldsDB(errorDetail);
    statusCode = customError.statusCode;
    status = customError.status;
    message = customError.message;
  }

  const jsonResponse: {
    status: string;
    message: string;
    error?: Record<string, any>;
    stack?: any;
  } = {
    status,
    message,
  };

  if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
    if (Object.keys(errorDetail).length > 0) {
      jsonResponse.error = errorDetail;
    }
    jsonResponse.stack = err.stack;
  }

  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);

  res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
