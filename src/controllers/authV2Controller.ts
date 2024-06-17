import { JWT_EXPIRES_IN, JWT_SECRET, JWT_TOKEN, NODE_ENV } from '@/config';
import { UserV2 } from '@/models/userV2';
import CustomError from '@/utils/customError';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface DecodedToken extends JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

const signToken = (id: string) => {
  return jwt.sign({ sub: id }, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const verifyToken = (token: string, secret: string): Promise<DecodedToken> => {
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

export const signupV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await UserV2.create(req.body);

    const token = signToken(newUser.id);

    res.status(201).json({ status: 'success', token, data: { user: newUser } });
  },
);

export const signinV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      const message = 'Please provide email and password!';
      return next(new CustomError(message, 400));
    }

    const userV2 = await UserV2.findOne({ email }).select('+password');

    if (!userV2 || !(await userV2.correctPassword(password, userV2.password))) {
      const message = 'Incorrect email or password';
      return next(new CustomError(message, 401));
    }

    const token = signToken(userV2.id);

    res.cookie(JWT_TOKEN!, token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
    });

    res.status(200).json({ status: 'success', token });
  },
);

export const protectV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[JWT_TOKEN!];

    if (!token) {
      const message = 'You are not logged in! Please log in to get access.';
      return next(new CustomError(message, 401));
    }

    const decoded = await verifyToken(token, JWT_SECRET!);
    console.log('decoded: ', decoded);

    if (!decoded.sub) {
      const message = 'User ID not found in the JWT payload';
      return next(new CustomError(message, 401));
    }

    const user = await UserV2.findById(decoded.sub);

    if (!user) {
      const message = 'User not found or unauthorized access';
      return next(new CustomError(message, 401));
    }

    const passwordChanged = user.changedPasswordAfter(decoded.iat);

    if (passwordChanged) {
      const message = 'User recently changed password! Please log in again.';
      return next(new CustomError(message, 401));
    }

    next();
  },
);