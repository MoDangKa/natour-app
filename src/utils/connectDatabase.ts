import mongoose from 'mongoose';

import { MONGO_LOCAL, MONGO_PASSWORD, MONGO_URI, NODE_ENV } from '@/config';

const connectDatabase = async () => {
  const databaseUrl =
    NODE_ENV === 'development'
      ? MONGO_LOCAL
      : MONGO_URI?.replace('<PASSWORD>', MONGO_PASSWORD!);

  if (!databaseUrl) {
    throw new Error('Database connection URL is missing or invalid.');
  }

  if (NODE_ENV === 'development' || NODE_ENV === 'alpha') {
    console.log(`Connecting to database at URL: ${databaseUrl}`);
  }

  await mongoose.connect(databaseUrl);
  console.log('Database connected successfully!');
};

export default connectDatabase;
