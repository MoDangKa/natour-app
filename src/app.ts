import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';
import apiV1Router from '@/routes/apiV1Router';
import connectDatabase from '@/utils/connectDatabase';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import path from 'path';
import { HOSTNAME, NODE_ENV, PORT } from './config';
import apiV2Router from './routes/apiV2Router';

const app = express();

app.use(cookieParser());
app.use(express.json());

if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  console.log(req.header);
  next();
});

app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);
app.all('*', notFoundMiddleware);
app.use(errorMiddleware);

const server = app.listen(parseInt(PORT!, 10), HOSTNAME!, () => {
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

process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (err: Error) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// const handleShutdown = (message: string) => {
//   console.log(`${message} received. Shutting down gracefully...`);
//   server.close(() => {
//     console.log('Process terminated!');
//   });
// };

// process.on('SIGINT', () => handleShutdown('SIGINT'));
// process.on('SIGTERM', () => handleShutdown('SIGTERM'));
