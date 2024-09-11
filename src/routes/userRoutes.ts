import { Router } from 'express';

import authController from '../controllers/authController';
import userController from '../controllers/userController';
import {
  uploadNoFile,
  uploadSingleUserPhoto,
} from '../middlewares/uploadMiddleware';
import {
  validateCreateUser,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateMe,
} from '../middlewares/validationUserMiddleware';

const router = Router();

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
  // validateUpdatePassword,
  uploadNoFile,
  authController.updatePassword,
);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  validateUpdateMe,
  uploadSingleUserPhoto,
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
