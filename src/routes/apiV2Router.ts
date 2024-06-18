import { Router } from 'express';
import userV2Routes from './userV2Routes';
import tourV2Routes from './tourV2Routes';

const apiV2Router = Router();

apiV2Router.use('/users', userV2Routes);
apiV2Router.use('/tours', tourV2Routes);

export default apiV2Router;
