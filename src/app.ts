import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import connectDatabase from '@/utils/connectDatabase';
import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

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
app.use(cookieParser());
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

const startServer = async () => {
  try {
    await connectDatabase();
  } catch (err) {
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

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// const handleTerminated = (event: string) => {
//   console.log(`${event} received. Shutting down gracefully...`);
//   server.close(() => {
//     console.log('Process terminated!');
//   });
// };

// process.on('SIGINT', () => handleTerminated('SIGINT'));
// process.on('SIGTERM', () => handleTerminated('SIGTERM'));
