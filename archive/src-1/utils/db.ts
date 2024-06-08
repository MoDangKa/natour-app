import mongoose from 'mongoose';

export const dbConfig = async (): Promise<void> => {
  try {
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
    process.exit(1);
  }
};
