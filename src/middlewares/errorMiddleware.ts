import CustomError from '@/utils/customError';
import { LogError } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';

const errorMiddleware = (
  err: CustomError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const customError = err instanceof CustomError ? err : null;
  const statusCode =
    customError?.statusCode || (err instanceof Error ? 400 : 500);
  const clientError = `${statusCode}`.startsWith('4');
  const status = clientError ? 'fail' : 'error';
  const errorMessage =
    customError?.message ||
    (clientError ? 'Something is wrong' : 'Internal Server Error');
  const errorDetails =
    customError?.errors ||
    (err instanceof Error && (err as any)?.errorResponse) ||
    {};

  const jsonResponse: { status: string; message: string; error?: any } = {
    status,
    message: errorMessage,
  };

  if (Object.keys(errorDetails).length > 0) {
    jsonResponse.error = errorDetails;
  }

  LogError(req.ip, req.method, req.originalUrl, statusCode, errorMessage);

  res.status(statusCode).json(jsonResponse);
};

export default errorMiddleware;
