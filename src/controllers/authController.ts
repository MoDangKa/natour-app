import { HASHING_SALT_ROUNDS, JWT_SECRET, JWT_TOKEN } from '@/config';
import { IUser, TRole, User } from '@/models/user';
import CustomError from '@/utils/customError';
import sendEmail from '@/utils/email';
import { correctPassword, createSendToken } from '@/utils/utils';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { jwtVerify } from 'jose';

export const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, email, ...userDetails } = req.body;

    if (!password || !email) {
      return next(new CustomError('Please provide email and password.', 400));
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(HASHING_SALT_ROUNDS!, 10),
    );

    const newUser = await User.create({
      ...userDetails,
      password: hashedPassword,
      email,
    });

    createSendToken(newUser, 201, res);
  },
);

export const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError('Please provide email and password!', 400));
    }

    const user = await User.findOne<IUser>({ email }).select('+password');

    if (!user || !(await correctPassword(password, user.password))) {
      return next(new CustomError('Incorrect email or password.', 401));
    }

    createSendToken(user, 200, res);
  },
);

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies[JWT_TOKEN!];

    if (!token) {
      return next(
        new CustomError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      );
    }

    const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.iat) {
      return next(
        new CustomError('User ID not found in the JWT payload.', 401),
      );
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return next(
        new CustomError('User not found or unauthorized access.', 401),
      );
    }

    const passwordChanged = user.changedPasswordAfter(payload.iat);

    if (passwordChanged) {
      return next(
        new CustomError(
          'User recently changed password! Please log in again.',
          401,
        ),
      );
    }

    req.user = user;
    next();
  },
);

export const restrictTo = (...roles: TRole[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (req.user?.role && !roles.includes(req.user.role)) {
        return next(
          new CustomError(
            'You do not have permission to perform this action.',
            403,
          ),
        );
      }
      next();
    },
  );
};

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new CustomError('There is no user with that email address.', 404),
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new CustomError(
          'There was an error sending the email. Try again later!',
          500,
        ),
      );
    }
  },
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new CustomError('Token is invalid or has expired.', 400));
    }

    user.password = await bcrypt.hash(
      req.body.password,
      parseInt(HASHING_SALT_ROUNDS!, 10),
    );
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  },
);

export const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { passwordCurrent, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return next(new CustomError('Passwords do not match.', 400));
    }

    const user = await User.findById(req.user?.id).select('+password');

    if (!user || !(await correctPassword(passwordCurrent, user.password))) {
      return next(new CustomError('Your current password is wrong.', 401));
    }

    user.password = await bcrypt.hash(
      password,
      parseInt(HASHING_SALT_ROUNDS!, 10),
    );

    await user.save();

    createSendToken(user, 200, res);
  },
);
