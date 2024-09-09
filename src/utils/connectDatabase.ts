import mongoose from 'mongoose';

import { databaseConfig, NODE_ENV } from '../config';

const connectDatabase = async () => {
  const databaseUrl =
    NODE_ENV === 'development'
      ? databaseConfig.MONGO_LOCAL
      : databaseConfig.MONGO_URI?.replace(
          '<PASSWORD>',
          databaseConfig.MONGO_PASSWORD!,
        );

  if (!databaseUrl) {
    throw new Error('Database connection URL is missing or invalid.');
  }

  if (NODE_ENV === 'development') {
    console.log(`Connecting to database at URL: ${databaseUrl}`);
  }

  await mongoose.connect(databaseUrl);
  console.log('Database connected successfully!');
};

export default connectDatabase;
