import mongoose from 'mongoose';

const connectToDatabase = async (): Promise<void> => {
  try {
    const databaseUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.DATABASE_LOCAL
        : process.env.DATABASE?.replace(
            '<PASSWORD>',
            process.env.DATABASE_PASSWORD || '',
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

export default connectToDatabase;
