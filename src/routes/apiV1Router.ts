import { Router } from 'express';
import tourRoutes from './tourRoutes';
import userRoutes from './userRoutes';

const apiV1Router = Router();

apiV1Router.use('/tours', tourRoutes);
apiV1Router.use('/users', userRoutes);

export default apiV1Router;
