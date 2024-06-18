import { TRole } from '@/@types/types';
import { hashPassword } from '@/utils/utils';
import crypto from 'crypto';
import mongoose, { Document, Model } from 'mongoose';
import validator from 'validator';

interface IUserV2 extends Document {
  name: string;
  email: string;
  photo?: string;
  role?: TRole;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  passwordResetToken?: String;
  passwordResetExpires?: Date;
  createPasswordResetToken: () => string;
  active?: boolean;
}

type IUserV2Keys = keyof IUserV2;

const userV2Keys: IUserV2Keys[] = [
  'name',
  'email',
  'photo',
  'role',
  'password',
  'passwordConfirm',
];

const userV2Schema = new mongoose.Schema<IUserV2>(
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
    photo: String,
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
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (this: IUserV2, val: string) {
          return val === this.password;
        },
        message: 'Passwords are not the same!',
      },
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
        delete ret.id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        delete ret.__v;
        return ret;
      },
    },
    collection: 'users',
  },
);

userV2Schema.pre<IUserV2>('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  this.passwordConfirm = undefined;
  next();
});

userV2Schema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      (this.passwordChangedAt.getTime() / 1000).toString(),
      10,
    );
    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

userV2Schema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const UserV2: Model<IUserV2> = mongoose.model<IUserV2>('UserV2', userV2Schema);

export { IUserV2, TRole, UserV2, userV2Keys };
