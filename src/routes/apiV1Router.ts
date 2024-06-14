import { Router } from 'express';
import authRoutes from './authRoutes';
import tourRoutes from './tourRoutes';

const apiV1Router = Router();

apiV1Router.use('/auth', authRoutes);
apiV1Router.use('/tours', tourRoutes);

export default apiV1Router;
