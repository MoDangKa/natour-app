import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import xss from 'xss-clean';
import hpp from 'hpp';

import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import apiV2Router from '@/routes/apiV2Router';
import connectDatabase from '@/utils/connectDatabase';
import { HOSTNAME, NODE_ENV, PORT } from './config';
import viewRouter from '@/routes/viewRoutes';

// Create express application instance
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware Configurations
 */

// Set security HTTP headers
app.use(helmet());

// Development logging
if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
  app.use(morgan('dev'));
}

// Rate limiting to prevent abuse (max 100 requests per hour per IP)
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// Body parsing middlware: reading data from body and attaching to req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp(),
  // hpp({
  //   whitelist: ['duration', 'ratingsQuantity'], // Example
  // }),
);

// Add request timestamp to each request
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

/**
 * Route Handling
 */

// Mount API routes
app.use('/', viewRouter);
app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);

// Handle undefined routes
app.all('*', notFoundMiddleware);

// Global error handling middleware
app.use(errorMiddleware);

/**
 * Start Server and Connect to Database
 */
const startServer = async () => {
  try {
    await connectDatabase();
    const port = parseInt(PORT!, 10) || 3000;
    const hostname = HOSTNAME || 'localhost';

    const server = app.listen(port, hostname, () => {
      console.log(`Server running on http://${hostname}:${port}`);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
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
