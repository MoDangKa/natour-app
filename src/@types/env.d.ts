declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    HOSTNAME: string;
    PORT: string;
    MONGO_URI: string;
    MONGO_PASSWORD: string;
    MONGO_LOCAL: string;
  }
}
