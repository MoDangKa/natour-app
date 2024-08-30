import * as dotenv from 'dotenv';
import path from 'path';

const ENV_FILE_PATH = path.resolve(__dirname, 'config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const {
  NODE_ENV,
  PORT,
  HOSTNAME,
  MONGO_LOCAL,
  MONGO_URI,
  MONGO_PASSWORD,
  JWT_SECRET,
  JWT_TOKEN,
  JWT_EXPIRES_IN,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  EMAIL_HOST,
  EMAIL_PORT,
  GMAIL_USERNAME,
  GMAIL_PASSWORD,
  HASHING_SALT_ROUNDS,
  JWT_COOKIE_EXPIRES_IN,
  EMAIL_FROM,
} = process.env as Record<string, string | undefined>;

const validateEnvVariable = (
  variableName: string,
  variableValue: string | undefined,
) => {
  if (!variableValue) {
    console.error(`Missing essential environment variable: ${variableName}`);
    process.exit(1);
  }
};

validateEnvVariable('PORT', PORT);
validateEnvVariable('HOSTNAME', HOSTNAME);
validateEnvVariable('JWT_SECRET', JWT_SECRET);
validateEnvVariable('JWT_TOKEN', JWT_TOKEN);
validateEnvVariable('JWT_EXPIRES_IN', JWT_EXPIRES_IN);
validateEnvVariable('JWT_COOKIE_EXPIRES_IN', JWT_COOKIE_EXPIRES_IN);
validateEnvVariable('HASHING_SALT_ROUNDS', HASHING_SALT_ROUNDS);

const port = parseInt(PORT!, 10) || 3000;
const hostname = HOSTNAME || 'http://localhost';

export {
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
  GMAIL_PASSWORD,
  GMAIL_USERNAME,
  HASHING_SALT_ROUNDS,
  HOSTNAME,
  JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  JWT_TOKEN,
  MONGO_LOCAL,
  MONGO_PASSWORD,
  MONGO_URI,
  NODE_ENV,
  PORT,
  hostname,
  port,
};
