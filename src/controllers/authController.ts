import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { jwtVerify } from 'jose';

import { TRole } from '../@types/types';
import { jwtConfig } from '../config';
import { IUser, User } from '../models/userModel';
import { CustomError } from '../utils';
import Email from '../utils/email';
import { correctPassword, createSendToken, hashPassword } from '../utils/utils';

const signup = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password, email, ...userDetails } = req.body;

    if (!password || !email) {
      return next(new CustomError('Please provide email and password.', 400));
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      ...userDetails,
      password: hashedPassword,
      email,
    });

    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log('url: ', url);

    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 201, res);
  },
);

const signin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError('Please provide email and password!', 400));
    }

    const user = await User.findOne<IUser>({ email }).select([
      '+password',
      '+active',
    ]);

    if (!user || !(await correctPassword(password, user.password))) {
      return next(new CustomError('Incorrect email or password.', 401));
    }

    if (!user.active) {
      return next(new CustomError('The user is inactive!', 403));
    }

    createSendToken(user, 200, res);
  },
);

const signOut = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie(jwtConfig.JWT_TOKEN!, 'sign out', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
  },
);

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const cookie = req.cookies && req.cookies[jwtConfig.JWT_TOKEN!];
    const token = authHeader?.split(' ')[1] || cookie;

    if (!token) {
      console.log('No token found');
      return next(
        new CustomError(
          'You are not logged in! Please log in to get access.',
          401,
        ),
      );
    }

    try {
      const secret: Uint8Array = new TextEncoder().encode(
        jwtConfig.JWT_SECRET!,
      );
      const { payload } = await jwtVerify(token, secret);

      if (!payload.sub || !payload.iat) {
        console.log('Invalid payload');
        return next(
          new CustomError('User ID not found in the JWT payload.', 401),
        );
      }

      const user = await User.findById(payload.sub).select('+active');

      if (!user) {
        return next(
          new CustomError('User not found or unauthorized access.', 401),
        );
      }

      if (!user.active) {
        return next(new CustomError('The user is inactive!', 403));
      }

      if (user.changedPasswordAfter(payload.iat)) {
        return next(
          new CustomError(
            'User recently changed password! Please log in again.',
            401,
          ),
        );
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      return next(new CustomError('Token verification failed!', 401));
    }
  },
);

// Only for rendered pages, no errors!
const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies && req.cookies[jwtConfig.JWT_TOKEN!];

  if (!token) {
    return next();
  }

  try {
    const secret: Uint8Array = new TextEncoder().encode(jwtConfig.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.iat) {
      return next();
    }

    const user = await User.findById(payload.sub).select('+active');

    console.log('User found:', user);

    if (!user || !user.active) {
      return next();
    }

    if (user.changedPasswordAfter(payload.iat)) {
      return next();
    }

    res.locals.user = user;
    return next();
  } catch (error) {
    return next();
  }
};

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
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new CustomError('There is no user with that email address.', 404),
      );
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

      // V1
      // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Your password reset token (valid for 10 min)',
      //   message,
      // });

      // V2
      await new Email(user, resetURL).sendPasswordReset();

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

    user.password = await hashPassword(req.body.password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  },
);

const updatePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { passwordCurrent, password, passwordConfirm } = req.body;

    if (password !== passwordConfirm) {
      return next(new CustomError('Passwords do not match.', 400));
    }

    const user = await User.findById(req.user?.id).select('+password');
    if (!user || !(await correctPassword(passwordCurrent, user.password))) {
      return next(new CustomError('Your current password is wrong.', 401));
    }

    user.password = await hashPassword(password);
    await user.save();

    createSendToken(user, 200, res);
  },
);

const authController = {
  signup,
  signin,
  signOut,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
};

export default authController;
