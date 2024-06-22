import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

import CustomError from '@/utils/customError';

export const validateRequiredFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const bodyKeys = Object.keys(req.body);
    const missingFields = requiredFields.filter(
      (field) => !bodyKeys.includes(field),
    );

    if (missingFields.length > 0) {
      return next(
        new CustomError(`Required fields: ${missingFields.join(', ')}`, 400),
      );
    }

    next();
  };
};

export const validateNoExtraFields = (expectedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const extraFields = Object.keys(req.body).filter(
      (field) => !expectedFields.includes(field),
    );

    if (extraFields.length) {
      return next(
        new CustomError(`Unexpected fields: ${extraFields.join(', ')}`, 400),
      );
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

    return next(
      new CustomError(
        `Validation Error: ${JSON.stringify(errorFields)}`,
        400,
        errors.array(),
      ),
    );
  }

  next();
};
