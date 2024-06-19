declare module 'hpp' {
  import { RequestHandler } from 'express';
  interface Options {
    whitelist?: string[] | { [key: string]: boolean };
  }
  const hpp: (options?: Options) => RequestHandler;
  export default hpp;
}
