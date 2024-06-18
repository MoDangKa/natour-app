import { Router } from 'express';
import userV2Routes from './userV2Routes';

const apiV2Router = Router();

apiV2Router.use('/users', userV2Routes);

export default apiV2Router;
