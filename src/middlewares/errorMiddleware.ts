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

  // JWT Errors
  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    const statusCode = 401;
    const status = 'failed';
    const message =
      err instanceof JsonWebTokenError
        ? 'Invalid token. Please log in again!'
        : 'Your token has expired. Please log in again.';
    writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);
    const response = organize(status, message, undefined, err.stack);
    return res.status(statusCode).json(response);
  }

  // Custom Operational Errors
  if (err.isOperational) {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    const message = err.message || 'An operational error occurred';
    writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);
    const response = organize(status, message, err.error, err.stack);
    return res.status(statusCode).json(response);
  }

  // Mongoose Validation Errors
  if (err.errors) {
    const statusCode = 400;
    const status = 'failed';
    const message = err.message || 'Validation failed';
    writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);
    const response = organize(status, message, err.errors, err.stack);
    return res.status(statusCode).json(response);
  }

  // Mongoose Specific Errors
  if (err.errorResponse) {
    let statusCode = 400;
    let status = 'failed';
    let message = 'Something went wrong!';
    let error = undefined;

    if (err.errorResponse.code === 11000) {
      const value = err.errorResponse.errmsg?.match(/".+?"/)?.[0];
      message = `Duplicate field value: ${value}. Please use another value!`;
      error = err?.errorResponse;
    } else if (err.errorResponse.code === 16755) {
      message = 'Something went wrong!';
    }

    writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);
    const response = organize(status, message, error, err.stack);
    return res.status(statusCode).json(response);
  }

  // Default to 500 Server Error
  const statusCode = 500;
  const status = 'error';
  const message = 'Something went wrong!';
  writeErrorLog(req.ip, req.method, req.originalUrl, statusCode, message);
  const response = organize(status, message, undefined, err.stack);
  return res.status(statusCode).json(response);
};

export default errorMiddleware;
