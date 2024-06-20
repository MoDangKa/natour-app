import { NextFunction, Request, Response } from 'express';

import { NODE_ENV } from '@/config';
import CustomError from '@/utils/customError';
import { writeErrorLog } from '@/utils/logger';

const handleCastErrorDB = (err: any): CustomError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new CustomError(message, 400);
};

const handleDuplicateFieldsDB = (err: any): CustomError => {
  const value = err?.errmsg?.match(/".+?"/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new CustomError(message, 400);
};

const handleJWTError = (): CustomError =>
  new CustomError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): CustomError =>
  new CustomError('Your token has expired. Please log in again.', 401);

const extractErrorDetails = (err: any): any => {
  return err?.error || err?.errors || err?.errorResponse || err || {};
};

const generateErrorResponse = (
  err: CustomError,
  errorDetail: any,
  statusCode: number,
  message: string,
): { status: string; message: string; error?: {}; stack?: string } => {
  const response: {
    status: string;
    message: string;
    error?: any;
    stack?: any;
  } = {
    status: statusCode < 500 ? 'fail' : 'error',
    message,
  };

  if (
    (NODE_ENV === 'development' || NODE_ENV === 'alpha') &&
    Object.keys(errorDetail).length > 0
  ) {
    response.error = errorDetail;
    response.stack = err.stack;
  }

  return response;
};

const handleSpecificErrors = (errorDetail: any): CustomError | null => {
  if (errorDetail.path && errorDetail.value)
    return handleCastErrorDB(errorDetail);
  if (errorDetail.code === 11000) return handleDuplicateFieldsDB(errorDetail);
  if (errorDetail.name === 'JsonWebTokenError') return handleJWTError();
  if (errorDetail.name === 'TokenExpiredError') return handleJWTExpiredError();
  if (errorDetail.errors) return new CustomError('Validation error', 400);
  return null;
};

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorDetail = extractErrorDetails(err);
  let { statusCode = 500, message = 'An unexpected error occurred' } = err;

  const specificError = handleSpecificErrors(errorDetail);
  if (specificError) {
    statusCode = specificError.statusCode;
    message = specificError.message;
  }

  const jsonResponse = generateErrorResponse(
    err,
    errorDetail,
    statusCode,
    message,
  );

  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);

  res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
