import { apiLogError } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express';
import { check, validationResult } from 'express-validator';

const validateAdditionalParams = (expectedParams: string[]) =>
  check('*').custom((value, { req }) => {
    const additionalParams = Object.keys(req.body).filter(
      (key) => !expectedParams.includes(key),
    );
    if (additionalParams.length > 0) {
      return Promise.reject('Invalid additional parameters provided');
    }
    return true;
  });

const handleValidationErrors = (
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
      .json({ status: 'fail', errors: errors.array() });
  }
  next();
};

export const validateId = [
  check('id').notEmpty().withMessage('Param id must be required'),
  handleValidationErrors,
];

export const validateTour = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string'),
  check('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isFloat({ gt: 0 })
    .withMessage('Duration must be a positive number'),
  check('difficulty')
    .notEmpty()
    .withMessage('Difficulty is required')
    .isString()
    .withMessage('Difficulty must be a string'),
  check('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  check('rating')
    .isFloat({ gt: 0, lt: 5 })
    .withMessage('Rating must be a float number between 0 and 5'),
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
