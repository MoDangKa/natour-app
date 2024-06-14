import { User } from '@/models/user';
import CustomError from '@/utils/customError';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SignJWT } from 'jose';

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, ...userDetails } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      ...userDetails,
      password: hashedPassword,
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  },
);

export const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    const jwtToken = process.env.JWT_TOKEN;

    if (!user) {
      res.cookie(jwtToken, '', { expires: new Date(0) });
      const errorMessage = 'Invalid credentials';
      return next(new CustomError(errorMessage, 404));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.cookie(jwtToken, '', { expires: new Date(0) });
      const errorMessage = 'Invalid credentials';
      return next(new CustomError(errorMessage, 404));
    }

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('2w')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    res.cookie(jwtToken, token, {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000, // Cookie expires in 2 weeks
      httpOnly: true, // Cookie is accessible only through the HTTP requests
      secure: true,
    });

    res.status(200).json({ status: 'success', data: { user } });
  },
);
