import {
  signin,
  signinV2,
  signup,
  signupV2,
} from '@/controllers/authController';
import { validateCreateUser } from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);
router.post('/signup/v2', signupV2);

router.post('/signin', signin);
router.post('/signin/v2', signinV2);

export default router;
