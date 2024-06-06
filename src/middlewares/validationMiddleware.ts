import { apiLogError } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

export const validateNoExtraFields = (expectedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const extraFields = Object.keys(req.body).filter(
      (field) => !expectedFields.includes(field),
    );
    if (extraFields.length) {
      const statusCode = 400;
      const errorMessage = `Unexpected fields: ${extraFields.join(', ')}`;
      apiLogError(
        req.ip,
        req.method,
        req.originalUrl,
        statusCode,
        errorMessage,
      );
      return res.status(statusCode).json({
        status: 'failed',
        message: errorMessage,
      });
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
    const statusCode = 400;
    const errorMessage = `Validation Error: ${JSON.stringify(errors.array())}`;
    apiLogError(req.ip, req.method, req.originalUrl, statusCode, errorMessage);
    return res
      .status(statusCode)
      .json({ status: 'failed', errors: errors.array() });
  }
  next();
};

export const validateId = [
  check('id').notEmpty().withMessage('Param id must be required'),
  handleValidationErrors,
];
