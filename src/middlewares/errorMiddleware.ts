import { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { NODE_ENV } from '@/config';
import { writeErrorLog } from '@/utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errorResponse?: {
    code?: number;
    errmsg?: string;
  };
  errors?: any;
  error?: any;
}

// Response Organizer
const organize = (
  status: string,
  message: string,
  error?: any,
  stack?: any,
) => {
  const response: any = { status, message };

  if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
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
  console.log('err:', err);

  // Default to 500 Server Error
  let statusCode = 500;
  let status = 'error';
  let message = 'Something went wrong!';
  let error = undefined;

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    // JWT Errors
    statusCode = 401;
    status = 'failed';
    message =
      err instanceof JsonWebTokenError
        ? 'Invalid token. Please log in again!'
        : 'Your token has expired. Please log in again.';
  } else if (err.isOperational) {
    // Custom Operational Errors
    statusCode = err.statusCode || 500;
    status = err.status || 'error';
    message = err.message || 'An operational error occurred';
  } else if (err.errors) {
    // Mongoose Validation Errors
    statusCode = 400;
    status = 'failed';
    message = err.message || 'Validation failed';
  } else if (err.errorResponse) {
    // Mongoose Specific Errors
    statusCode = 400;
    status = 'failed';

    if (err.errorResponse.code === 11000) {
      const value = err.errorResponse.errmsg?.match(/".+?"/)?.[0];
      message = `Duplicate field value: ${value}. Please use another value!`;
      error = err?.errorResponse;
    } else if (err.errorResponse.code === 16755) {
      message = 'Something went wrong!';
    }
  }

  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);
  const response = organize(status, message, error, err.stack);
  return res.status(statusCode).json(response);
};

export default errorMiddleware;
