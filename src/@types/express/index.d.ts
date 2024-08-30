declare namespace Express {
  export interface Request {
    requestTime?: string;
    user?: { id: string | number };
    files:
      | {
          imageCover?: Express.Multer.File[];
          images?: Express.Multer.File[];
          [fieldname: string]: Express.Multer.File[] | undefined;
        }
      | undefined;
  }

  interface Response {
    locals: {
      nonce?: string;
      [key: string]: any;
    };
  }
}
