import express from 'express';
import * as dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import dbConfig from '@/configs/dbConfig';
import apiV1Router from '@/routes/apiV1Router';
import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, 'configs', 'config.env') });

const { NODE_ENV, PORT, HOSTNAME } = process.env;

if (!PORT || !HOSTNAME) {
  console.error('Missing essential environment variables: PORT or HOSTNAME');
  process.exit(1);
}

const app = express();

app.use(express.json());

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiV1Router);

app.all('*', notFoundMiddleware);

app.use(errorMiddleware);

const server = app.listen(parseInt(PORT, 10), HOSTNAME, () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
});

const startServer = async () => {
  try {
    // await dbConfig();
    const databaseUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.MONGO_LOCAL
        : process.env.MONGO_URI?.replace(
            '<PASSWORD>',
            process.env.MONGO_PASSWORD || '',
          );

    if (!databaseUrl) {
      throw new Error('Database connection URL is missing or invalid.');
    }

    await mongoose.connect(databaseUrl);
    console.log('Database connected successfully!');
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error connecting to the database:', err.message);
    } else {
      console.error('An unknown error occurred:', err);
    }
    server.close(() => {
      process.exit(1);
    });
  }
};

startServer();
