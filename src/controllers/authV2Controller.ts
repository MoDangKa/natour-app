import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { TRole } from '@/@types/types';
import { JWT_SECRET, JWT_TOKEN } from '@/config';
import { UserV2 } from '@/models/userV2Model';
import CustomError from '@/utils/customError';
import { sendEmail } from '@/utils/email';
import { correctPassword, createSendTokenV2, verifyToken } from '@/utils/utils';

const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newUser = await UserV2.create(req.body);
    createSendTokenV2(newUser, 201, res);
  },
);

const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError('Please provide email and password!', 400));
    }

    const user = await UserV2.findOne({ email }).select([
      '+password',
      '+active',
    ]);

    if (!user || !(await correctPassword(password, user.password))) {
      return next(new CustomError('Incorrect email or password.', 401));
    }

    if (!user.active) {
      return next(new CustomError('The user is inactive!', 403));
    }

    createSendTokenV2(user, 200, res);
  },
);

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookie = req.cookies && req.cookies[JWT_TOKEN!];
    const token = authHeader?.split(' ')[1] || cookie;

    if (!token) {
      return next(
        new CustomError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      );
    }

    const decoded = await verifyToken(token, JWT_SECRET!);
    if (!decoded.sub) {
      return next(
        new CustomError('User ID not found in the JWT payload.', 401),
      );
    }

    const user = await UserV2.findById(decoded.sub).select('+active');

    if (!user) {
      return next(
        new CustomError('User not found or unauthorized access.', 401),
      );
    }

    if (!user.active) {
      return next(new CustomError('The user is inactive!', 403));
    }

    if (user.changedPasswordAfter(decoded.iat)) {
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

const restrictTo = (...roles: TRole[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role && !roles.includes(req.user.role)) {
      return next(
        new CustomError(
          'You do not have permission to perform this action.',
          403,
        ),
      );
    }
    next();
  });

const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserV2.findOne({ email: req.body.email });
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

const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, passwordConfirm } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await UserV2.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new CustomError('Token is invalid or has expired.', 400));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendTokenV2(user, 200, res);
  },
);

const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { passwordCurrent, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return next(new CustomError('Passwords do not match.', 400));
    }

    const user = await UserV2.findById(req.user?.id).select('+password');
    if (!user || !(await correctPassword(passwordCurrent, user.password))) {
      return next(new CustomError('Your current password is wrong.', 401));
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    createSendTokenV2(user, 200, res);
  },
);

const authController = {
  signup,
  signin,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};

export default authController;
