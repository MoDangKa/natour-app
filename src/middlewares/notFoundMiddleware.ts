import CustomError from '@/utils/CustomError';
import { NextFunction, Request, Response } from 'express';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorMessage = `Can't find ${req.originalUrl} on this server!`;
  next(new CustomError(errorMessage, 404));
};

export default notFoundMiddleware;
