import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { Tour } from '../models/tour';
import { readFile } from './fileHelper';

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

const importData = async () => {
  try {
    const tours = await readFile('tours-simple.json');
    await Tour.create(tours);
    console.log('Data successfully imported!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('All tour data successfully deleted!');
  } catch (error) {
    console.error('Error deleting data:', error);
  }
};

const run = async () => {
  try {
    await connectDatabase();

    const argv2 = process.argv?.[2];
    if (argv2 === '--import') {
      await importData();
    } else if (argv2 === '--delete') {
      await deleteData();
    } else {
      console.log(
        'Invalid command. Use "--import" to import data or "--delete" to delete all data.',
      );
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
  process.exit();
};

run();
