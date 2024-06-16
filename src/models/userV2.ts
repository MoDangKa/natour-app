import bcrypt from 'bcrypt';
import mongoose, { Document, Model } from 'mongoose';
import validator from 'validator';

interface IUserV2 extends Document {
  name: string;
  email: string;
  photo?: string;
  password: string;
  passwordConfirm?: string;
  correctPassword(
    candidatePassword: string,
    userPassword: string,
  ): Promise<boolean>;
}

type IUserV2Keys = keyof IUserV2;

const userV2Keys: IUserV2Keys[] = [
  'name',
  'email',
  'photo',
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
    photo: String,
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
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userV2Schema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
) {
  if (!userPassword) return false;
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UserV2: Model<IUserV2> = mongoose.model<IUserV2>('UserV2', userV2Schema);

export { IUserV2, UserV2, userV2Keys };
