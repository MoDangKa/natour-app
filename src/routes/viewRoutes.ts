import { Request, Router, Response } from 'express';

import viewController from '@/controllers/viewController';

const router = Router();

router.get('/', viewController.getOverview);
router.get('/overview', viewController.getOverview);

export default router;
