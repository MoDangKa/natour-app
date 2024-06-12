import { LogError } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

const validateAdditionalParams = (expectedParams: string[]) =>
  check('*').custom((value, { req }) => {
    const additionalParams = Object.keys(req.body).filter(
      (key) => !expectedParams.includes(key)
    );
    if (additionalParams.length > 0) {
      return Promise.reject('Invalid additional parameters provided');
    }
    return true;
  });

const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = `Validation Error: ${JSON.stringify(errors.array())}`;
    LogError(req.ip, req.method, req.originalUrl, errorMessage);
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

export const validateId = [
  check('id').isNumeric().withMessage('Param id must be a number'),
  handleValidationErrors,
];

export const validateCreateTour = [
  check('name').isString().notEmpty().withMessage('Name is required'),
  check('duration').isNumeric().withMessage('Duration must be a number'),
  check('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  handleValidationErrors,
];

export const validateUser = [
  check('name').isString().notEmpty().withMessage('Name is required'),
  check('email').isString().notEmpty().withMessage('Email is required'),
  check('role').isString().notEmpty().withMessage('Role is required'),
  check('password').isString().notEmpty().withMessage('Password is required'),
  validateAdditionalParams(['name', 'email', 'role', 'password']),
  handleValidationErrors,
];
