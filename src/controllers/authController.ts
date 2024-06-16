import { JWT_EXPIRES_IN, JWT_SECRET, JWT_TOKEN, NODE_ENV } from '@/config';
import { User } from '@/models/user';
import CustomError from '@/utils/customError';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SignJWT, jwtVerify } from 'jose';

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

export const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      const message = 'Please provide email and password!';
      return next(new CustomError(message, 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      const message = 'Incorrect email or password';
      return next(new CustomError(message, 401));
    }

    const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET!);
    const token: string = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRES_IN!)
      .sign(secret);

    res.cookie(JWT_TOKEN!, token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
    });

    res.status(200).json({ status: 'success', token });
  },
);

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[JWT_TOKEN!];

    if (!token) {
      const message = 'You are not logged in! Please log in to get access.';
      next(new CustomError(message, 401));
    }

    const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      const message = 'User ID not found in the JWT payload';
      next(new CustomError(message, 403));
    }

    const user = await User.findOne({ _id: payload.sub });

    if (!user) {
      const message = 'User not found or unauthorized access';
      next(new CustomError(message, 403));
    }

    next();
  },
);
