import CustomError from '@/utils/CustomError';
import { NextFunction, Request, Response } from 'express';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next(new CustomError(`Can't find ${req.originalUrl} on this server!`, 404));
};

export default notFoundMiddleware;
