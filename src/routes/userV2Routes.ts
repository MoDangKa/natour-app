import { Router } from 'express';

import authV2Controller from '@/controllers/authV2Controller';
import {
  validateCreateUserV2,
  validateForgotPassword,
  validateResetPassword,
  validateUpdatePassword,
} from '@/middlewares/validationUserMiddleware';

const router = Router();

router.post('/signup', validateCreateUserV2, authV2Controller.signup);
router.post('/signin', authV2Controller.signin);

router.post(
  '/forgotPassword',
  validateForgotPassword,
  authV2Controller.forgotPassword,
);
router.patch(
  '/resetPassword/:token',
  validateResetPassword,
  authV2Controller.resetPassword,
);
router.patch(
  '/updateMyPassword',
  authV2Controller.protect,
  validateUpdatePassword,
  authV2Controller.updatePassword,
);

export default router;
