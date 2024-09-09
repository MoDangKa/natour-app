import { ValidationChain, body } from 'express-validator';

import { requiredUserKeys, userKeys } from '../models/userModel';
import { userV2Keys } from '../models/userV2Model';
import {
  handleValidationErrors,
  validateNoExtraFields,
  validateRequiredFields,
} from './validationMiddleware';
import { TRole } from '../@types/types';

const requireValidations: Record<string, ValidationChain> = {
  name: body('name').isString().withMessage('Please tell us your name!'),
  email: body('email').isEmail().withMessage('Please provide your email'),
  password: body('password')
    .isStrongPassword()
    .isLength({ min: 8 })
    .withMessage('Please provide a password'),
  passwordConfirm: body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords are not the same!'),
};

const commonValidations: Record<string, ValidationChain> = {
  photo: body('photo')
    .optional()
    .isString()
    .withMessage('Photo must be a string'),
  role: body('role')
    .optional()
    .isIn(['user', 'guide', 'lead-guide', 'admin'] as TRole[])
    .withMessage('Role is either: user, guide, lead-guide, admin'),
};

export const validateCreateUser = [
  validateRequiredFields(requiredUserKeys),
  validateNoExtraFields(userKeys),
  ...Object.values(requireValidations),
  ...Object.values(commonValidations),
  handleValidationErrors,
];

export const validateCreateUserV2 = [
  validateRequiredFields(requiredUserKeys),
  validateNoExtraFields(userV2Keys),
  ...Object.values(requireValidations),
  ...Object.values(commonValidations),
  handleValidationErrors,
];

export const validateForgotPassword = [
  validateNoExtraFields(['email']),
  requireValidations.email,
  handleValidationErrors,
];

export const validateResetPassword = [
  validateNoExtraFields(['password', 'passwordConfirm']),
  requireValidations.password,
  requireValidations.passwordConfirm,
  handleValidationErrors,
];

export const validateUpdatePassword = [
  validateNoExtraFields(['passwordCurrent', 'password', 'passwordConfirm']),
  requireValidations.password,
  requireValidations.passwordConfirm,
  handleValidationErrors,
];

export const validateUpdateMe = [
  validateNoExtraFields(['name', 'email', 'photo', 'role']),
  requireValidations.name.optional(),
  requireValidations.email.optional(),
  commonValidations.photo,
  commonValidations.role,
  handleValidationErrors,
];
