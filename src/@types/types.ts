import { JwtPayload } from 'jsonwebtoken';

export interface DecodedToken extends JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export interface ICleanUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
