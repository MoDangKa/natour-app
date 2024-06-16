import { JWT_EXPIRES_IN, JWT_SECRET, JWT_TOKEN, NODE_ENV } from '@/config';
import { User } from '@/models/user';
import { UserV2 } from '@/models/userV2';
import CustomError from '@/utils/customError';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SignJWT, jwtVerify } from 'jose';
import jwt from 'jsonwebtoken';

const signToken = (id: string) => {
  return jwt.sign({ id }, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, ...userDetails } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      ...userDetails,
      password: hashedPassword,
    });

    res.status(201).json({ status: 'success', data: { user: newUser } });
  },
);

export const signupV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await UserV2.create(req.body);

    const token = signToken(newUser.id);

    res.status(201).json({ status: 'success', token, data: { user: newUser } });
  },
);

export const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new CustomError('Incorrect email or password', 401));
    }

    const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET!);
    const token: string = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('2w')
      .sign(secret);

    res.cookie(JWT_TOKEN!, token, {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // Cookie expires in 2 weeks
      httpOnly: true,
      secure: NODE_ENV === 'production',
    });

    res.status(200).json({ status: 'success', token });
  },
);

export const signinV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError('Please provide email and password!', 400));
    }

    const userV2 = await UserV2.findOne({ email }).select('+password');

    if (!userV2 || !(await userV2.correctPassword(password, userV2.password))) {
      return next(new CustomError('Incorrect email or password', 401));
    }

    const token = signToken(userV2.id);

    res.cookie(JWT_TOKEN!, token, {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // Cookie expires in 2 weeks
      httpOnly: true,
      secure: NODE_ENV === 'production',
    });

    res.status(200).json({ status: 'success', token });
  },
);

export const authenticated = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[JWT_TOKEN!];

    if (!token) {
      throw new CustomError('Unauthorized', 403);
    }

    const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      res.cookie(JWT_TOKEN!, '', { expires: new Date(0) });
      throw new CustomError('User ID not found in the JWT payload', 403);
    }

    const user = await User.findOne({ _id: payload.sub });

    if (!user) {
      res.cookie(JWT_TOKEN!, '', { expires: new Date(0) }); // Maybe no use
      throw new CustomError('User not found or unauthorized access', 403);
    }

    next();
  },
);
