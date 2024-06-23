import { ValidationChain, body, checkSchema, param } from 'express-validator';
import { isValidObjectId } from 'mongoose';

import { reviewKeys, reviewSchema } from '@/models/reviewModel';
import {
  handleValidationErrors,
  validateNoExtraFields,
  validateRequiredFields,
} from './validationMiddleware';

const requireValidations: Record<string, ValidationChain> = {
  review: body('review')
    .isString()
    .notEmpty()
    .withMessage('Review must be a non-empty string'),
  rating: body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be a float number between 1 and 5'),
  tour: body('tour')
    .custom(isValidObjectId)
    .withMessage('Review must belong to a valid tour'),
  user: body('user')
    .custom(isValidObjectId)
    .withMessage('Review must belong to a valid user'),
};

// export const validateCreateReview: RequestHandler[] = [
//   validateNoExtraFields(reviewKeys),
//   ...Object.values(requireValidations),
//   handleValidationErrors,
// ];

export const validateCreateReview = [
  validateRequiredFields(reviewKeys),
  validateNoExtraFields(reviewKeys),
  checkSchema(reviewSchema),
  handleValidationErrors,
];

export const validateCreateReviewV2 = [
  param('tourId')
    .custom(isValidObjectId)
    .withMessage('Tour id must be a valid ObjectId.'),
  validateRequiredFields(['review', 'rating']),
  validateNoExtraFields(reviewKeys),
  requireValidations.review,
  requireValidations.rating,
  handleValidationErrors,
];
