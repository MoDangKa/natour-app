declare namespace Express {
  export interface Request {
    requestTime?: string;
  }

  interface Response {
    locals: {
      nonce?: string;
      [key: string]: any;
    };
  }
}
