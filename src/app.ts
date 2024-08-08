import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
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
import { HOSTNAME, PORT } from './config';

const app = express();
dotenv.config();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigins = ['http://example.com', 'https://example.com'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true,
  }),
);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp(),
  // hpp({
  //   whitelist: ['duration', 'ratingsQuantity'], // Example
  // }),
);

app.set('trust proxy', 1);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  res.locals.nonce = Buffer.from(crypto.randomBytes(16)).toString('base64');
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

    function gracefulShutdown(signal: string) {
      console.log(`Received ${signal}. Shutting down gracefully.`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
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
