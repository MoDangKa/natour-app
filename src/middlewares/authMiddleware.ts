import { User } from '@/models/user';
import CustomError from '@/utils/customError';
import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';

const authorizeAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const jwtToken = req.cookies[process.env.JWT_TOKEN!];
    if (!jwtToken) {
      next(new CustomError('Unauthorized', 403));
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(jwtToken, secret);

    if (!payload.sub) {
      next(new CustomError('User ID not found in the JWT payload', 403));
    }

    await User.findOne({ _id: payload.sub });

    next();
  } catch (error) {
    next(new CustomError('Unauthorized - Admin access required', 403));
  }
};

export default authorizeAdmin;
