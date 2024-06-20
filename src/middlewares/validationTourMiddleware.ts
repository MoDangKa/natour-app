import { check } from 'express-validator';

import { TDifficulty, tourKeys } from '@/models/tourModel';
import {
  handleValidationErrors,
  validateNoExtraFields,
} from './validationMiddleware';

const requireValidations = {
  name: check('name')
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .isLength({ min: 10 })
    .withMessage('A tour name must have more or equal than 10 characters')
    .bail()
    .isLength({ max: 40 })
    .withMessage('A tour name must have less or equal than 40 characters'),
  duration: check('duration')
    .isFloat({ gt: 0 })
    .withMessage('Duration must be a positive number'),
  maxGroupSize: check('maxGroupSize')
    .isInt({ gt: 0 })
    .withMessage('Max group size must be a positive number'),
  difficulty: check('difficulty')
    .isIn(['easy', 'medium', 'difficult'] as TDifficulty[])
    .withMessage('Difficulty must be one of: easy, medium, difficult'),
  price: check('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
  ratingsAverage: check('ratingsAverage')
    .isFloat({ gt: 1, lt: 5 })
    .withMessage('Ratings average must be a float number between 1.0 and 5.0'),
  description: check('description')
    .isString()
    .withMessage('Description must be a string'),
  imageCover: check('imageCover')
    .isString()
    .withMessage('Image cover must be a string'),
};

const commonValidations = {
  priceDiscount: check('priceDiscount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price discount must be greater than 0'),
  ratingsQuantity: check('ratingsQuantity')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Ratings quantity must be greater than or equal to 0'),
  summary: check('summary')
    .optional()
    .isString()
    .withMessage('Summary must be a string'),
  images: check('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
    .bail()
    .custom((values) => {
      values.forEach((value: any) => {
        if (typeof value !== 'string') {
          throw new Error('Each image must be a string');
        }
      });
      return true;
    }),
  startDates: check('startDates')
    .optional()
    .isArray()
    .withMessage('Start dates must be an array')
    .bail()
    .custom((values) => {
      values.forEach((value: any) => {
        if (typeof value !== 'string') {
          throw new Error('Each start date must be a string');
        }
      });
      return true;
    }),
};

export const validateCreateTour = [
  validateNoExtraFields(tourKeys),
  ...Object.values(requireValidations),
  ...Object.values(commonValidations),
  handleValidationErrors,
];

export const validateUpdateTour = [
  validateNoExtraFields(tourKeys),
  ...Object.values(requireValidations).map((validation) =>
    validation.optional(),
  ),
  ...Object.values(commonValidations),
  handleValidationErrors,
];
