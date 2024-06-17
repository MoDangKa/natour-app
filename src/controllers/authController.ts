import { JWT_EXPIRES_IN, JWT_SECRET, JWT_TOKEN, NODE_ENV } from '@/config';
import { User, TRole } from '@/models/user';
import CustomError from '@/utils/customError';
import sendEmail from '@/utils/email';
import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

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
      return next(new CustomError(message, 401));
    }

    const secret: Uint8Array = new TextEncoder().encode(JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub || !payload.iat) {
      const message = 'User ID not found in the JWT payload';
      return next(new CustomError(message, 401));
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      const message = 'User not found or unauthorized access';
      return next(new CustomError(message, 401));
    }

    const passwordChanged = user.changedPasswordAfter(payload.iat);

    if (passwordChanged) {
      const message = 'User recently changed password! Please log in again.';
      return next(new CustomError(message, 401));
    }

    req.user = user;
    next();
  },
);

export const restrictTo = (...roles: TRole[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role && !roles.includes(req.user.role)) {
      const message = 'You do not have permission to perform this action';
      return next(new CustomError(message, 403));
    }
    next();
  });

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const message = 'There is no user with email address.';
      return next(new CustomError(message, 404));
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

      const message = 'There was an error sending the email. Try again later!';
      return next(new CustomError(message, 500));
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
      const message = 'Token is invalid or has expired';
      return next(new CustomError(message, 400));
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Reset password is success',
    });
  },
);
