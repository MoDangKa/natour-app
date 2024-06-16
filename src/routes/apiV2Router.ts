import { Router } from 'express';
import authV2Routes from './authV2Routes';

const apiV2Router = Router();

apiV2Router.use('/auth', authV2Routes);

export default apiV2Router;
