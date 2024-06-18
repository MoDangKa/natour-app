import {
  forgotPassword,
  protect,
  resetPassword,
  signin,
  signup,
  updatePassword,
} from '@/controllers/authController';
import {
  validateCreateUser,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
} from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);
router.post('/signin', signin);

router.post('/forgotPassword', validateForgotPassword, forgotPassword);
router.patch('/resetPassword/:token', validateResetPassword, resetPassword);
router.patch(
  '/updateMyPassword',
  protect,
  validateUpdatePassword,
  updatePassword,
);

export default router;
