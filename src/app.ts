import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import * as dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'config.env') });

const { NODE_ENV, PORT, HOSTNAME, MONGO_LOCAL, MONGO_URI, MONGO_PASSWORD } =
  process.env as Record<string, string | undefined>;

if (!PORT || !HOSTNAME) {
  console.error('Missing essential environment variables: PORT or HOSTNAME');
  process.exit(1);
}

const isDevOrAlpha = NODE_ENV === 'development' || NODE_ENV === 'alpha';

const app = express();

app.use(express.json());

if (isDevOrAlpha) {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiV1Router);

app.all('*', notFoundMiddleware);

app.use(errorMiddleware);

const server = app.listen(parseInt(PORT, 10), HOSTNAME, () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
});

const connectDatabase = async () => {
  const databaseUrl =
    NODE_ENV === 'development'
      ? MONGO_LOCAL
      : MONGO_URI?.replace('<PASSWORD>', MONGO_PASSWORD!);

  if (!databaseUrl) {
    throw new Error('Database connection URL is missing or invalid.');
  }

  if (isDevOrAlpha) {
    console.log(`Connecting to database at URL: ${databaseUrl}`);
  }

  await mongoose.connect(databaseUrl);
  console.log('Database connected successfully!');
};

const handleError = (err: unknown, event: string) => {
  if (err instanceof Error) {
    console.error(`${event}! 💥`, err.message);
  } else {
    console.error(`${event}! 💥`, err);
  }
  server.close(() => {
    process.exit(1);
  });
};

const startServer = async () => {
  try {
    await connectDatabase();
  } catch (err) {
    handleError(err, 'ERROR IN DATABASE CONNECTION');
  }
};

startServer();

process.on('unhandledRejection', (err) =>
  handleError(err, 'UNHANDLED REJECTION'),
);
process.on('uncaughtException', (err) =>
  handleError(err, 'UNCAUGHT EXCEPTION'),
);

const handleTerminated = (event: string) => {
  console.log(`${event} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('Process terminated!');
  });
};

process.on('SIGINT', () => handleTerminated('SIGINT'));
process.on('SIGTERM', () => handleTerminated('SIGTERM'));
