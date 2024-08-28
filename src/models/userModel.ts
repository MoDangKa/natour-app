import crypto from 'crypto';
import mongoose, { Document, Model } from 'mongoose';
import validator from 'validator';

import { TRole } from '@/@types/types';

interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  role?: TRole;
  password: string;
  passwordCurrent: string;
  passwordConfirm: string;
  passwordChangedAt?: Date;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  passwordResetToken?: String;
  passwordResetExpires?: Date;
  createPasswordResetToken: () => string;
  active?: boolean;
}

type TUserKeys = keyof IUser;

const requiredUserKeys: TUserKeys[] = [
  'name',
  'email',
  'password',
  'passwordConfirm',
];

const commonUserKeys: TUserKeys[] = ['photo', 'role'];

const userKeys: TUserKeys[] = [...requiredUserKeys, ...commonUserKeys];

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'guide', 'lead-guide', 'admin'] as TRole[],
        message: 'Role is either: user, guide, lead-guide, admin',
      },
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    collection: 'users',
  },
);

userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = new Date(Date.now());
  next();
});

// userSchema.pre<Query<any, IUser>>(/^find/, function (next) {
//   this.find({ active: { $ne: false } });
//   (this as any).start = Date.now();
//   next();
// });

// userSchema.post<Query<any, IUser>>(/^find/, function (doc, next) {
//   console.log(
//     `User query took ${Date.now() - (this as any).start} milliseconds!`,
//   );
//   next();
// });

userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export { IUser, User, commonUserKeys, requiredUserKeys, userKeys };
