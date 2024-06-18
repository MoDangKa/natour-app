import { DecodedToken, ICleanUser } from '@/@types/types';
import { JWT_EXPIRES_IN, JWT_SECRET, JWT_TOKEN, NODE_ENV } from '@/config';
import { IUser } from '@/models/user';
import { IUserV2 } from '@/models/userV2';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import { SignJWT } from 'jose';
import jwt from 'jsonwebtoken';

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
  res.cookie(JWT_TOKEN!, token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
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
