import * as dotenv from 'dotenv';
import path from 'path';

const ENV_FILE_PATH = path.resolve(__dirname, 'config.env');
const dotenvResult = dotenv.config({ path: ENV_FILE_PATH });

if (dotenvResult.error) {
  console.error('Error loading environment variables:', dotenvResult.error);
  process.exit(1);
}

const { NODE_ENV, PORT, HOSTNAME, MONGO_LOCAL, MONGO_URI, MONGO_PASSWORD } =
  process.env as Record<string, string | undefined>;

if (!PORT) {
  console.error('Missing essential environment variable: PORT');
  process.exit(1);
}

if (!HOSTNAME) {
  console.error('Missing essential environment variable: HOSTNAME');
  process.exit(1);
}

export { HOSTNAME, MONGO_LOCAL, MONGO_PASSWORD, MONGO_URI, NODE_ENV, PORT };
