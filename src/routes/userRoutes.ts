import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import authController from '@/controllers/authController';
import userController from '@/controllers/userController';
import {
  validateCreateUser,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateMe,
  validateUpdatePassword,
} from '@/middlewares/validationUserMiddleware';

const router = Router();
const upload = multer({ dest: path.join(__dirname, 'uploads') });

router.post('/signup', validateCreateUser, authController.signup);
router.post('/signin', authController.signin);
router.get('/sign-out', authController.signOut);

router.post(
  '/forgotPassword',
  validateForgotPassword,
  authController.forgotPassword,
);
router.patch(
  '/resetPassword/:token',
  validateResetPassword,
  authController.resetPassword,
);

router.use(authController.protect);

router.patch(
  '/updateMyPassword',
  upload.none(),
  validateUpdatePassword,
  authController.updatePassword,
);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  validateUpdateMe,
  upload.none(),
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .post(userController.createUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
