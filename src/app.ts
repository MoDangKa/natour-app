import dbConfig from '@/configs/dbConfig';
import apiV1Router from '@/routes/apiV1Router';
import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import errorMiddleware from '@/middlewares/errorMiddleware';
import notFoundMiddleware from '@/middlewares/notFoundMiddleware';

const ENV_FILE_PATH = path.resolve(__dirname, 'configs', 'config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', apiV1Router);

app.all('*', notFoundMiddleware);

app.use(errorMiddleware);

const startServer = async () => {
  try {
    await dbConfig();

    const port = parseInt(process.env.PORT!, 10);
    const hostname = process.env.HOSTNAME!;

    app.listen(port, hostname, () => {
      console.log(`Server running on http://${hostname}:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
