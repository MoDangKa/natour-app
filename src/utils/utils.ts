import { DecodedToken, ICleanUser, TObject } from '@/@types/types';
import {
  HASHING_SALT_ROUNDS,
  JWT_COOKIE_EXPIRES_IN,
  JWT_EXPIRES_IN,
  JWT_SECRET,
  JWT_TOKEN,
  NODE_ENV,
} from '@/config';
import { IUser } from '@/models/userModel';
import { IUserV2 } from '@/models/userV2Model';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import { SignJWT } from 'jose';
import jwt from 'jsonwebtoken';
import CustomError from './customError';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, parseInt(HASHING_SALT_ROUNDS!, 10));
};

export const correctPassword = async function (
  candidatePassword: string,
  userPassword?: string,
): Promise<boolean> {
  if (!userPassword) return false;
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const signToken = async (id: string): Promise<string> => {
  const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET);
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN!)
    .sign(secret);
};

export const signTokenV2 = (id: string): string => {
  return jwt.sign({ sub: id }, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (
  token: string,
  secret: string,
): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded as DecodedToken);
      }
    });
  });
};

const createSendTokenCommon = (
  token: string,
  user: ICleanUser,
  statusCode: number,
  res: Response,
) => {
  const cookieExpiresInDays = parseInt(JWT_COOKIE_EXPIRES_IN!, 10);

  if (isNaN(cookieExpiresInDays)) {
    return new CustomError(
      'Invalid JWT_COOKIE_EXPIRES_IN value in environment variables',
      400,
    );
  }

  const maxAge = cookieExpiresInDays * 24 * 60 * 60 * 1000;

  res.cookie(JWT_TOKEN!, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

export const createSendToken = async (
  user: IUser,
  statusCode: number,
  res: Response,
) => {
  const token = await signToken(user.id);
  const cleanUser: ICleanUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role!,
  };
  createSendTokenCommon(token, cleanUser, statusCode, res);
};

export const createSendTokenV2 = (
  user: IUserV2,
  statusCode: number,
  res: Response,
) => {
  const token = signTokenV2(user.id);
  const cleanUser: ICleanUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role!,
  };
  createSendTokenCommon(token, cleanUser, statusCode, res);
};

export const filterObj = (obj: TObject, ...allowedFields: string[]) => {
  const newObj: TObject = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
