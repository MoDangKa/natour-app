declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'alpha' | 'production';
    HOSTNAME: string;
    PORT: string;
    MONGO_URI: string;
    MONGO_PASSWORD: string;
    MONGO_LOCAL: string;
    JWT_TOKEN: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_COOKIE_EXPIRES_IN: string;
    HASHING_SALT_ROUNDS: string;
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;
    GMAIL_USERNAME: string;
    GMAIL_PASSWORD: string;
    EMAIL_FROM: string;
    STRIPE_PUBLISH_KEY: string;
    STRIPE_SECRET_KEY: string;
  }
}
