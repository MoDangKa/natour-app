import { NextFunction, Request, Response } from 'express';
import { apiLogError } from './logger';

const handleUnknownRoutes = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errorMessage = `Can't find ${req.originalUrl} on this server!`;
  apiLogError(req.ip, req.method, req.originalUrl, 404, errorMessage);
  res.status(404).json({
    status: 'failed',
    message: errorMessage,
  });
};

export default handleUnknownRoutes;
