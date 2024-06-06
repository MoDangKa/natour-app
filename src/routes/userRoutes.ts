import {
  // createUser,
  // deleteUserById,
  getAllUsers,
  // getUserById,
  // updateUserById,
} from '@/controllers/userController';
import { validateId, validateUser } from '@/middlewares/validationMiddleware';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

router.route('/').get(asyncHandler(getAllUsers));
// .post(validateUser, asyncHandler(createUser));

router.use('/:id', validateId);

// router
//   .route('/tours/:id')
//   .get( asyncHandler(getUserById))
//   .patch( validateUser, asyncHandler(updateUserById))
//   .delete( asyncHandler(deleteUserById));

export default router;
