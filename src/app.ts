import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import connectDatabase from './utils/connectDatabase';

const ENV_FILE_PATH = path.resolve(__dirname, 'config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const { NODE_ENV, PORT, HOSTNAME } = process.env as Record<
  string,
  string | undefined
>;

if (!PORT || !HOSTNAME) {
  console.error('Missing essential environment variables: PORT or HOSTNAME');
  process.exit(1);
}

const app = express();

app.use(express.json());

if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiV1Router);

app.all('*', notFoundMiddleware);

app.use(errorMiddleware);

const server = app.listen(parseInt(PORT, 10), HOSTNAME, () => {
  console.log(`Server running on http://${HOSTNAME}:${PORT}`);
});

const eventError = (err: unknown, event: string) => {
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
    eventError(err, 'ERROR IN DATABASE CONNECTION');
  }
};

startServer();

process.on('unhandledRejection', (err) =>
  eventError(err, 'UNHANDLED REJECTION'),
);
process.on('uncaughtException', (err) => eventError(err, 'UNCAUGHT EXCEPTION'));

// const handleTerminated = (event: string) => {
//   console.log(`${event} received. Shutting down gracefully...`);
//   server.close(() => {
//     console.log('Process terminated!');
//   });
// };

// process.on('SIGINT', () => handleTerminated('SIGINT'));
// process.on('SIGTERM', () => handleTerminated('SIGTERM'));
