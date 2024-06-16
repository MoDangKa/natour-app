import { signin, signup, signupV2 } from '@/controllers/authController';
import { validateCreateUser } from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);
router.post('/signup/v2', signupV2);

router.post('/signin', signin);

export default router;
