import { signinV2, signupV2 } from '@/controllers/authV2Controller';
import { validateCreateUserV2 } from '@/middlewares/validationUserMiddleware';
import { Router } from 'express';

const router = Router();

router.post('/signup', validateCreateUserV2, signupV2);
router.post('/signin', signinV2);

export default router;
