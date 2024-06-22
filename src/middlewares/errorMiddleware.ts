import { NODE_ENV } from '@/config';
import CustomError from '@/utils/customError';
import { writeErrorLog } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const handleCastErrorDB = (err: any): CustomError => {
  return new CustomError(`Invalid ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (err: any): CustomError => {
  const value = err?.errmsg?.match(/".+?"/)?.[0];
  return new CustomError(
    `Duplicate field value: ${value}. Please use another value!`,
    400,
  );
};

const handleJWTError = (): CustomError =>
  new CustomError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): CustomError =>
  new CustomError('Your token has expired. Please log in again.', 401);

const handleValidationError = (errors: any[]): CustomError => {
  const errorFields = errors.map((err: any) => ({
    [err.path]: err?.properties?.message,
  }));
  const message = `Validation Error: ${JSON.stringify(errorFields)}`;
  return new CustomError(message, 400, errorFields);
};

const extractErrorDetails = (err: any): any =>
  err?.error || err?.errors || err?.errorResponse || err || {};

const generateErrorResponse = (
  err: CustomError,
  statusCode: number,
  message: string,
  errorDetail: any = {},
): { status: string; message: string; error?: {}; stack?: string } => {
  const response: any = {
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
  if (Array.isArray(errorDetail)) return handleValidationError(errorDetail);
  if (Object.values(errorDetail).length)
    return handleValidationError(Object.values(errorDetail));
  return null;
};

const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err?.isOperational) {
    writeErrorLog(
      req.ip,
      req.method,
      req.originalUrl,
      err.statusCode,
      err.message,
    );
    const jsonResponse = generateErrorResponse(
      err,
      err?.statusCode,
      err?.message,
      err?.error || {},
    );
    return res.status(err.statusCode).json(jsonResponse);
  }

  const errorDetail = extractErrorDetails(err);
  let { statusCode = 500, message = 'An unexpected error occurred' } = err;

  const specificError = handleSpecificErrors(errorDetail);
  if (specificError) {
    statusCode = specificError.statusCode;
    message = specificError.message;
  }

  const jsonResponse = generateErrorResponse(
    err,
    statusCode,
    message,
    errorDetail,
  );
  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);

  return res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
