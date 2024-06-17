import {
  forgotPassword,
  resetPassword,
  signin,
  signup,
} from '@/controllers/authController';
import {
  validateCreateUser,
  validateForgotPassword,
  validateResetPassword,
} from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);
router.post('/signin', signin);

router.post('/forgotPassword', validateForgotPassword, forgotPassword);
router.patch('/resetPassword/:token', validateResetPassword, resetPassword);

export default router;
