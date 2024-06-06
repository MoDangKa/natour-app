import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import path from 'path';
import apiV1Router from '@/routes/apiV1Router';
import { apiLogError } from '@/utils/logger';
import mongoose from 'mongoose';
import { Tour } from '@/models/tourModel';

const ENV_FILE_PATH = path.resolve(__dirname, 'config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const database =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE?.replace(
        '<PASSWORD>',
        process.env.DATABASE_PASSWORD || '',
      );

if (!database) {
  console.error('Database connection URL is missing or invalid.');
  process.exit(1);
}

console.log('Database:', database);

mongoose
  .connect(database)
  .then(() => {
    console.log('Database connection successful!');

    const app = express();

    app.use(express.json());

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }

    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/api/v1', apiV1Router);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      if (res.headersSent) {
        return next(err);
      }

      const isClientError =
        err instanceof SyntaxError ||
        (err instanceof Error && err.message.startsWith('Client error:'));
      const statusCode = isClientError ? 400 : 500;
      const errorMessage = isClientError
        ? err.message
        : 'Internal Server Error';

      apiLogError(req.ip, req.method, req.originalUrl, err.message);
      res.status(statusCode).json({
        status: isClientError ? 'failed' : 'error',
        message: errorMessage,
      });
    });

    const hostname = process.env.HOSTNAME || '127.0.0.1';
    const port = parseInt(process.env.PORT!, 10) || 3000;

    if (isNaN(port)) {
      console.error(
        'Invalid PORT number provided in environment variables. Defaulting to port 3000.',
      );
      process.exit(1);
    }

    const testTour = new Tour({
      name: 'The Forest Hiker B',
      rating: 4.7,
      price: 497,
    });

    testTour
      .save()
      .then((doc) => {
        console.log(doc);
      })
      .catch((err) => {
        console.log('ERROR 💥');
      });

    app.listen(port, hostname, () => {
      console.log(`App running on ${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });
