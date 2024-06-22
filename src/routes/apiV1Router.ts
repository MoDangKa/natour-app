import { Router } from 'express';

import reviewRoutes from './reviewRoutes';
import tourRoutes from './tourRoutes';
import userRoutes from './userRoutes';

const apiV1Router = Router();

apiV1Router.use('/tours', tourRoutes);
apiV1Router.use('/users', userRoutes);
apiV1Router.use('/reviews', reviewRoutes);

export default apiV1Router;
