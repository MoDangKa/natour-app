import { Router } from 'express';
import authV2Routes from './authV2Routes';
import tourV2Routes from './tourV2Routes';

const apiV2Router = Router();

apiV2Router.use('/auth', authV2Routes);
apiV2Router.use('/tours', tourV2Routes);

export default apiV2Router;
