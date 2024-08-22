import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { NODE_ENV } from '@/config';
import { recordLog, recordLog2 } from '@/utils/logger';
import { CustomError } from '@/@types/types';

// Response Organizer
const organize = (
  status: string,
  message: string,
  error?: any,
  stack?: any,
) => {
  const response: any = { status, message };

  if (process.env.NODE_ENV !== 'production') {
    if (error) {
      response.error = error;
    }
    if (stack) {
      response.stack = stack;
    }
  }

  return response;
};

// Error Middleware
const errorMiddleware = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): Response | void => {
  console.error('Error middleware called:', err);

  // Default to 500 Server Error
  let statusCode = 500;
  let status = 'error';
  let message = 'Something went wrong!';
  let error = undefined;

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    // JWT Errors
    statusCode = 401;
    status = 'fail';
    message =
      err instanceof JsonWebTokenError
        ? 'Invalid token. Please log in again!'
        : 'Your token has expired. Please log in again.';
  } else if (err.isOperational) {
    // Custom Operational Errors
    statusCode = err.statusCode || 500;
    status = err.status || 'error';
    message = err.message || 'An operational error occurred.';
  } else if (err.errors) {
    // Mongoose Validation Errors
    statusCode = 400;
    status = 'fail';
    message = err.message || 'Validation failed';
    error = err.errors;
  } else if (err.errorResponse) {
    // Mongoose Specific Errors
    statusCode = 400;
    status = 'fail';

    if (err.errorResponse.code === 11000) {
      const value = err.errorResponse.errmsg?.match(/\"(.+?)\"/)?.[0];
      message = `Duplicate field value: "${value}". Please use another value!`;
    } else if (err.errorResponse.code === 16755) {
      message = 'Something went wrong!';
    }

    error = err.errorResponse;
  }

  // recordLog(req, statusCode, message);
  recordLog2(req, statusCode, message);
  const response = organize(status, message, error, err.stack);
  res.status(statusCode).json(response);
  return next();
};

export default errorMiddleware;
