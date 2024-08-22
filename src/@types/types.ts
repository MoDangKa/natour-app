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

export type TRole = 'user' | 'guide' | 'lead-guide' | 'admin';
export type TObject = Record<string, any>;

export interface PopOptions {
  path: string;
  select?: string;
  model?: string;
}

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errorResponse?: {
    code?: number;
    errmsg?: string;
  };
  errors?: any;
  error?: any;
}
