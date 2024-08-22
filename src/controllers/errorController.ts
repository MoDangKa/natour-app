import { NextFunction, Request, Response } from 'express';

import { NODE_ENV } from '@/config';
import errorMiddleware from '@/middlewares/errorMiddleware';
import CustomError from '@/utils/customError';

const handleGlobalError = (
  err: Error | CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Determine if it's an API request
  const isApiRequest = req.originalUrl.startsWith('/api');

  if (isApiRequest) {
    // Use the API error middleware
    errorMiddleware(err, req, res, next);
  } else {
    // Handle non-API errors
    const statusCode = (err as CustomError).statusCode || 500;
    const errorMessage =
      NODE_ENV === 'production' ? 'Something went wrong' : err.message;

    res.status(statusCode).render('error', {
      title: 'Error',
      message: errorMessage,
    });
  }
};

const errorController = { handleGlobalError };

export default errorController;
