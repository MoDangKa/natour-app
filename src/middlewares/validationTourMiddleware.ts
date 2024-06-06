import { check } from 'express-validator';
import {
  handleValidationErrors,
  validateNoExtraFields,
} from './validationMiddleware';

export const validateCreateTour = [
  validateNoExtraFields(['name', 'duration', 'difficulty', 'price', 'rating']),
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .bail()
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
    .bail()
    .isString()
    .withMessage('Difficulty must be a string'),
  check('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  check('rating')
    .isFloat({ gt: 0, lt: 5 })
    .withMessage('Rating must be a float number between 0 and 5'),
  handleValidationErrors,
];

export const validateUpdateTour = [
  validateNoExtraFields(['name', 'duration', 'difficulty', 'price', 'rating']),
  check('name').optional().isString().withMessage('Name must be a string'),
  check('duration')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Duration must be a positive number'),
  check('difficulty')
    .optional()
    .isString()
    .withMessage('Difficulty must be a string'),
  check('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
  check('rating')
    .optional()
    .isFloat({ gt: 0, lt: 5 })
    .withMessage('Rating must be a float number between 0 and 5'),
  handleValidationErrors,
];
