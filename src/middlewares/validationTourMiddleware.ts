import { body, ValidationChain } from 'express-validator';
import mongoose from 'mongoose';

import { requireTourKeys, TDifficulty, tourKeys } from '../models/tourModel';
import {
  handleValidationErrors,
  validateNoExtraFields,
  validateRequiredFields,
} from './validationMiddleware';

const isValidObjectId = (value: string) =>
  mongoose.Types.ObjectId.isValid(value);

const requireValidations: Record<string, ValidationChain> = {
  name: body('name')
    .isString()
    .withMessage('Name must be a string')
    .bail()
    .isLength({ min: 10 })
    .withMessage('A tour name must have more or equal than 10 characters')
    .bail()
    .isLength({ max: 40 })
    .withMessage('A tour name must have less or equal than 40 characters'),
  duration: body('duration')
    .isInt({ gt: 0 })
    .withMessage('Duration must be a positive number'),
  maxGroupSize: body('maxGroupSize')
    .isInt({ gt: 0 })
    .withMessage('Max group size must be a positive number'),
  difficulty: body('difficulty')
    .isIn(['easy', 'medium', 'difficult'] as TDifficulty[])
    .withMessage('Difficulty must be one of: easy, medium, difficult'),
  price: body('price')
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0'),
  ratingsAverage: body('ratingsAverage')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Ratings average must be a float number between 1.0 and 5.0'),
  description: body('description')
    .isString()
    .withMessage('Description must be a string'),
  imageCover: body('imageCover')
    .isString()
    .withMessage('Image cover must be a string'),
};

const commonValidations: Record<string, ValidationChain> = {
  priceDiscount: body('priceDiscount')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price discount must be greater than 0'),
  ratingsQuantity: body('ratingsQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ratings quantity must be greater than or equal to 0'),
  summary: body('summary')
    .optional()
    .isString()
    .withMessage('Summary must be a string'),
  images: body('images')
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
  startDates: body('startDates')
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

  guides: body('guides')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Guides must be a non-empty array')
    .bail()
    .custom((guides: any[]) => guides.every(isValidObjectId))
    .withMessage('Each guide must be a valid ObjectId'),
};

const startLocationValidation: ValidationChain[] = [
  body('startLocation').optional().isObject(),
  body('startLocation.type')
    .optional()
    .isString()
    .custom((value) => value === 'Point')
    .withMessage('startLocation.type must be "Point"'),
  body('startLocation.coordinates')
    .optional()
    .isArray()
    .custom(
      (coords) =>
        coords.length === 2 &&
        coords.every((num: unknown) => typeof num === 'number'),
    )
    .withMessage('startLocation.coordinates must be an array of two numbers'),
  body('startLocation.address')
    .optional()
    .isString()
    .withMessage('startLocation.address must be a string'),
  body('startLocation.description')
    .optional()
    .isString()
    .withMessage('startLocation.description must be a string'),
];

const locationsValidation: ValidationChain[] = [
  body('locations').optional().isArray(),
  body('locations.*.type')
    .exists({ checkFalsy: true })
    .isString()
    .custom((value) => value === 'Point')
    .withMessage('Each location.type must be "Point"'),
  body('locations.*.coordinates')
    .exists({ checkFalsy: true })
    .isArray()
    .custom(
      (coords) =>
        coords.length === 2 &&
        coords.every((num: unknown) => typeof num === 'number'),
    )
    .withMessage('Each location.coordinates must be an array of two numbers'),
  body('locations.*.address')
    .exists({ checkFalsy: true })
    .isString()
    .withMessage('Each location.address must be a string'),
  body('locations.*.description')
    .exists({ checkFalsy: true })
    .isString()
    .withMessage('Each location.description must be a string'),
  body('locations.*.day')
    .exists({ checkFalsy: true })
    .isInt()
    .withMessage('Each location.day must be an integer'),
];

const validateCreateTour = [
  validateRequiredFields(requireTourKeys),
  validateNoExtraFields(tourKeys),
  ...Object.values(requireValidations),
  ...Object.values(commonValidations),
  ...startLocationValidation,
  ...locationsValidation,
  handleValidationErrors,
];

const validateUpdateTour = [
  validateNoExtraFields(tourKeys),
  ...Object.values(requireValidations).map((el) => el.optional()),
  ...Object.values(commonValidations),
  ...startLocationValidation,
  ...locationsValidation,
  handleValidationErrors,
];

export { validateCreateTour, validateUpdateTour };
