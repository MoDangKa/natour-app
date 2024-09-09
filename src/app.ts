import dotenv from 'dotenv';
import express from 'express';
import path from 'path';

import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import apiV2Router from '@/routes/apiV2Router';
import viewRouter from '@/routes/viewRoutes';
import connectDatabase from '@/utils/connectDatabase';
import { logger } from '@/utils/logger';
import { hostname, port } from './config';
import errorController from './controllers/errorController';
import { applyMiddleware } from './middleware';

const app = express();
dotenv.config();

applyMiddleware(app);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /');
});

app.set('trust proxy', 1);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/', viewRouter);
app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);

app.all('*', notFoundMiddleware);
app.use(errorController.handleGlobalError);

const handleErrors = () => {
  process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    process.exit(1);
  });
};

const setupGracefulShutdown = (server: any) => {
  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully.`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(port, hostname, () => {
      logger.info(`Server running on http://${hostname}:${port}`);
    });

    handleErrors();
    setupGracefulShutdown(server);
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
