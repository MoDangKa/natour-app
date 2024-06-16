import { signin, signup } from '@/controllers/authController';
import { validateCreateUser } from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUser, signup);
router.post('/signin', signin);

export default router;
