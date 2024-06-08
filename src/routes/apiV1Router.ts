import { aliasTopTours, getAllTours } from '@/controllers/tourController';
import { Router } from 'express';
import tourRoutes from './tourRoutes';

const apiV1Router = Router();

apiV1Router.use('/tours', tourRoutes);

export default apiV1Router;
