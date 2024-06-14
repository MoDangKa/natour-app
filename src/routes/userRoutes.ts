import { signup } from '@/controllers/authController';
import { validateCreateUser } from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);

export default router;
