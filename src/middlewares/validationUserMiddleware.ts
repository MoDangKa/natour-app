import { userKeys } from '@/models/user';
import { TRole, userV2Keys } from '@/models/userV2';
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
    .withMessage('Passwords are not the same!'),
};

const commonValidations = {
  photo: check('photo')
    .optional()
    .isString()
    .withMessage('Photo must be a string'),
  role: check('role')
    .optional()
    .isIn(['user', 'guide', 'lead-guide', 'admin'] as TRole[])
    .withMessage('Role is either: user, guide, lead-guide, admin'),
};

export const validateCreateUser = [
  validateNoExtraFields(userKeys),
  ...Object.values(requireValidations),
  ...Object.values(commonValidations),
  handleValidationErrors,
];

export const validateCreateUserV2 = [
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
  check('passwordCurrent')
    .isStrongPassword()
    .isLength({ min: 8 })
    .withMessage('Please provide a current password'),
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
