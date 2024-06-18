import {
  forgotPassword,
  protect,
  resetPassword,
  restrictTo,
  signin,
  signup,
  updatePassword,
} from '@/controllers/authController';
import {
  createUser,
  deleteMe,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateMe,
  updateUserById,
} from '@/controllers/userController';
import {
  validateCreateUser,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateMe,
  validateUpdatePassword,
} from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);
router.post('/signin', signin);

router.post('/forgotPassword', validateForgotPassword, forgotPassword);
router.patch('/resetPassword/:token', validateResetPassword, resetPassword);

router.use(protect);

router.patch('/updateMyPassword', validateUpdatePassword, updatePassword);
router.patch('/updateMe', validateUpdateMe, updateMe);
router.delete('/deleteMe', deleteMe);

router.get('/', getAllUsers);

router
  .route('/:id')
  .get(getUserById)
  .post(createUser)
  .patch(updateUserById)
  .delete(restrictTo('admin'), deleteUserById);

export default router;
