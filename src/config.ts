import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from config.env file
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
  STRIPE_PUBLISH_KEY,
  STRIPE_SECRET_KEY,
} = process.env as Record<string, string | undefined>;

// Helper function to validate environment variables
const validateEnvVariable = (
  variableName: string,
  variableValue: string | undefined,
) => {
  if (!variableValue) {
    console.error(`Missing essential environment variable: ${variableName}`);
    process.exit(1);
  }
};

// Validate essential environment variables
const essentialVariables = [
  { name: 'PORT', value: PORT },
  { name: 'HOSTNAME', value: HOSTNAME },
  { name: 'JWT_SECRET', value: JWT_SECRET },
  { name: 'JWT_TOKEN', value: JWT_TOKEN },
  { name: 'JWT_EXPIRES_IN', value: JWT_EXPIRES_IN },
  { name: 'JWT_COOKIE_EXPIRES_IN', value: JWT_COOKIE_EXPIRES_IN },
  { name: 'HASHING_SALT_ROUNDS', value: HASHING_SALT_ROUNDS },
];

essentialVariables.forEach(({ name, value }) =>
  validateEnvVariable(name, value),
);

// Default configurations
const port = parseInt(PORT!, 10) || 3000;
const hostname = HOSTNAME || 'http://localhost';

// Exporting configurations
const emailConfig = {
  EMAIL_FROM,
  EMAIL_HOST,
  EMAIL_PASSWORD,
  EMAIL_PORT,
  EMAIL_USERNAME,
  GMAIL_PASSWORD,
  GMAIL_USERNAME,
};

const jwtConfig = {
  JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  JWT_TOKEN,
};

const databaseConfig = {
  MONGO_LOCAL,
  MONGO_URI,
  MONGO_PASSWORD,
};

// Exporting all configurations
export {
  HASHING_SALT_ROUNDS,
  NODE_ENV,
  STRIPE_PUBLISH_KEY,
  STRIPE_SECRET_KEY,
  databaseConfig,
  emailConfig,
  hostname,
  jwtConfig,
  port,
};
