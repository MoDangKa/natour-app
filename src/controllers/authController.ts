import { User } from '@/models/user';
import { UserV2 } from '@/models/userV2';
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

export const signupV2 = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await UserV2.create(req.body);
    res.status(201).json({ status: 'success', data: { user: newUser } });
  },
);

export const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new CustomError('Invalid credentials', 401));
    }

    const jwtToken: string = process.env.JWT_TOKEN!;
    const secret: Uint8Array = new TextEncoder().encode(
      process.env.JWT_SECRET!,
    );
    const token: string = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('2w')
      .sign(secret);

    res.cookie(jwtToken, token, {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // Cookie expires in 2 weeks
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ status: 'success', data: { user } });
  },
);

export const authorizeAdmin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const jwtToken = process.env.JWT_TOKEN!;
    const token = req.cookies[jwtToken];

    if (!token) {
      throw new CustomError('Unauthorized', 403);
    }

    const jwtSecret = process.env.JWT_SECRET!;
    const secret: Uint8Array = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      res.cookie(jwtToken, '', { expires: new Date(0) });
      throw new CustomError('User ID not found in the JWT payload', 403);
    }

    const user = await User.findOne({ _id: payload.sub });

    if (!user) {
      res.cookie(jwtToken, '', { expires: new Date(0) }); // Maybe no use
      throw new CustomError('User not found or unauthorized access', 403);
    }

    next();
  },
);
