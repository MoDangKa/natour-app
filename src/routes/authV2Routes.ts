import { signinV2, signupV2 } from '@/controllers/authV2Controller';
import { Router } from 'express';

const router = Router();

router.post('/signup', signupV2);
router.post('/signin', signinV2);

export default router;
