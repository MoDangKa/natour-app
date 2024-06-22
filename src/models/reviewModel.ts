import { Schema } from 'express-validator';
import mongoose, { Document, Model, Query, isValidObjectId } from 'mongoose';

interface IReview extends Document {
  review: string;
  rating: number;
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt?: Date;
}

type TReviewKeys = keyof IReview;

const reviewKeys: TReviewKeys[] = ['review', 'rating', 'tour', 'user'];

const reviewSchema: Schema = {
  review: {
    in: ['body'],
    isString: {
      errorMessage: 'Review must be a non-empty string',
    },
    notEmpty: {
      errorMessage: 'Review must be a non-empty string',
    },
  },
  rating: {
    in: ['body'],
    isNumeric: {
      bail: true,
      errorMessage: 'Rating must be a numeric value',
    },
    custom: {
      bail: true,
      options: (value) => {
        return Number.isInteger(Number(value));
      },
      errorMessage: 'Rating must be an integer number',
    },
    isInt: {
      bail: true,
      options: { min: 1, max: 5 },
      errorMessage: 'Rating must be an integer number between 1 and 5',
    },
  },
  tour: {
    in: ['body'],
    custom: {
      options: isValidObjectId,
      errorMessage: 'Review must belong to a valid tour',
    },
  },
  user: {
    in: ['body'],
    custom: {
      options: isValidObjectId,
      errorMessage: 'Review must belong to a valid user',
    },
  },
};

const reviewMongooseSchema = new mongoose.Schema<IReview>(
  {
    review: {
      type: String,
      require: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
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
    collection: 'reviews',
  },
);

reviewMongooseSchema.pre<Query<any, IReview>>(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review: Model<IReview> = mongoose.model<IReview>(
  'Review',
  reviewMongooseSchema,
);

export { IReview, Review, reviewKeys, reviewSchema };
