import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../utils';

const notFoundMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorMessage = `Can't find ${req.originalUrl} on this server!`;
  next(new CustomError(errorMessage, 404));
};

export default notFoundMiddleware;
