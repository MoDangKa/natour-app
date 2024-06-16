import { NODE_ENV } from '@/config';
import CustomError from '@/utils/customError';
import { writeErrorLog } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const handleCastErrorDB = (err: any) => {
  const errorMessage = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(errorMessage, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err?.errmsg?.match(/".+?"/)?.[0];
  const errorMessage = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(errorMessage, 400);
};

const extractErrorDetails = (err: any) => {
  return (
    err?.error || (err?.errors && err) || (err?.errorResponse && err) || {}
  );
};

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = err.statusCode || 500;
  let status = err.status || 'error';
  let message = err.message;

  const errorDetail = extractErrorDetails(err);

  if (errorDetail.path && errorDetail.value) {
    const customError = handleCastErrorDB(errorDetail);
    statusCode = customError.statusCode;
    status = customError.status;
    message = customError.message;
  } else if (errorDetail.code === 11000) {
    const customError = handleDuplicateFieldsDB(errorDetail);
    statusCode = customError.statusCode;
    status = customError.status;
    message = customError.message;
  } else if (errorDetail.errors) {
    statusCode = 400;
    status = 'fail';
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
