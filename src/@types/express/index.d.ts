declare namespace Express {
  export interface Request {
    requestTime?: string;
    user?: { id: string | number };
  }

  interface Response {
    locals: {
      nonce?: string;
      [key: string]: any;
    };
  }
}
