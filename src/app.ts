import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import path from 'path';
import xss from 'xss-clean';

import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import apiV2Router from '@/routes/apiV2Router';
import viewRouter from '@/routes/viewRoutes';
import connectDatabase from '@/utils/connectDatabase';
import { HOSTNAME, NODE_ENV, PORT } from './config';

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.options('*', cors());
app.use(helmet());

if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp(),
  // hpp({
  //   whitelist: ['duration', 'ratingsQuantity'], // Example
  // }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);

app.all('*', notFoundMiddleware);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await connectDatabase();
    const port = parseInt(PORT!, 10) || 3000;
    const hostname = HOSTNAME || 'localhost';

    const server = app.listen(port, hostname, () => {
      console.log(`Server running on http://${hostname}:${port}`);
    });

    process.on('uncaughtException', (err: Error) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('unhandledRejection', (err: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    process.exit(1);
  }
};

startServer();
