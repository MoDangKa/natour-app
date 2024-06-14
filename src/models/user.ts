import mongoose, { Document, Model } from 'mongoose';
import validator from 'validator';

interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  password: string;
  passwordConfirm: string;
}

type IUserKeys = keyof IUser;

const userKeys: IUserKeys[] = [
  'name',
  'email',
  'photo',
  'password',
  'passwordConfirm',
];

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
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
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

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export { IUser, User, userKeys };
