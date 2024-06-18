import {
  forgotPasswordV2,
  protectV2,
  resetPasswordV2,
  signinV2,
  signupV2,
  updatePasswordV2,
} from '@/controllers/authV2Controller';
import {
  validateCreateUserV2,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
} from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUserV2, signupV2);
router.post('/signin', signinV2);

router.post('/forgotPassword', validateForgotPassword, forgotPasswordV2);
router.patch('/resetPassword/:token', validateResetPassword, resetPasswordV2);
router.patch(
  '/updateMyPassword',
  protectV2,
  validateUpdatePassword,
  updatePasswordV2,
);

export default router;
