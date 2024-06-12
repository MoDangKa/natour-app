import CustomError from '@/utils/CustomError';
import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validateNoExtraFields = (expectedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const extraFields = Object.keys(req.body).filter(
      (field) => !expectedFields.includes(field),
    );
    if (extraFields.length) {
      const errorMessage = `Unexpected fields: ${extraFields.join(', ')}`;
      return next(new CustomError(errorMessage, 400));
    }
    next();
  };
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorFields = errors.array().map((err: any) => ({
      [err.path]: err.msg,
    }));
    const errorMessage = `Validation Error: ${JSON.stringify(errorFields)}`;
    return next(new CustomError(errorMessage, 400, errors.array()));
  }
  next();
};
