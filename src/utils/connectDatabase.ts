import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

const ENV_FILE_PATH = path.resolve(__dirname, '../config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const { NODE_ENV, MONGO_LOCAL, MONGO_URI, MONGO_PASSWORD } =
  process.env as Record<string, string | undefined>;

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
