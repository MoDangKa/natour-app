import { IUser } from '@/models/user';
import { IUserV2 } from '@/models/userV2';

declare module 'express' {
  interface Request {
    user?: IUser | IUserV2;
    locals?: {
      user: IUser | IUserV2;
    };
  }
}
