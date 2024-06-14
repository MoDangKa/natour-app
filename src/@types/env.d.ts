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
  }
}
