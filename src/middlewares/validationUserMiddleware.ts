import { userKeys } from '@/models/user';
import { check } from 'express-validator';
import {
  handleValidationErrors,
  validateNoExtraFields,
} from './validationMiddleware';

const requireValidations = {
  name: check('name').isString().withMessage('Please tell us your name!'),
  email: check('email').isEmail().withMessage('Please provide your email'),
  password: check('password')
    .isStrongPassword()
    .isLength({ min: 8 })
    .withMessage('Please provide a password'),
  passwordConfirm: check('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
};

const commonValidations = {
  photo: check('photo')
    .optional()
    .isString()
    .withMessage('Photo must be a string'),
};

export const validateCreateUser = [
  validateNoExtraFields(userKeys),
  ...Object.values(requireValidations),
  ...Object.values(commonValidations),
  handleValidationErrors,
];
