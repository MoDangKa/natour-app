import { Schema } from 'express-validator';
import mongoose, { Document, Model, Query } from 'mongoose';

// Interface for the Review document
interface IReview extends Document {
  review: string;
  rating: number;
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt?: Date;
}

// Interface for the Review model with the static method
interface IReviewModel extends Model<IReview> {
  calcAverageRatings: (tourId: mongoose.Types.ObjectId) => Promise<void>;
}

// Type for the keys of Review document
type TReviewKeys = keyof IReview;
const reviewKeys: TReviewKeys[] = ['review', 'rating', 'tour', 'user'];

// Schema validation using express-validator
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
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage: 'Rating must be an integer between 1 and 5',
    },
  },
  tour: {
    in: ['body'],
    custom: {
      options: (value) => mongoose.isValidObjectId(value),
      errorMessage: 'Review must belong to a valid tour',
    },
  },
  user: {
    in: ['body'],
    custom: {
      options: (value) => mongoose.isValidObjectId(value),
      errorMessage: 'Review must belong to a valid user',
    },
  },
};

// Mongoose schema definition
const reviewMongooseSchema = new mongoose.Schema<IReview>(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer.',
      },
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection: 'reviews',
  },
);

reviewMongooseSchema.index({ tour: 1, user: 1 }, { unique: true });

// Adding a pre-hook for the find and findOne queries
reviewMongooseSchema.pre<Query<any, IReview>>(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// Adding static method to calculate average ratings
reviewMongooseSchema.statics.calcAverageRatings = async function (
  tourId: mongoose.Types.ObjectId,
) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: parseFloat(stats[0].avgRating.toFixed(1)),
    });
  } else {
    await mongoose.model('Tour').findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

// Document middleware to call the method for calculating average ratings
reviewMongooseSchema.post<IReview>('save', function () {
  (this.constructor as IReviewModel).calcAverageRatings(this.tour);
});

// Extend the query object type to include the `r` property
interface QueryWithDocument<T extends Document> extends Query<any, T> {
  r?: T | null;
}

// Pre-middleware for findOneAndUpdate and findOneAndDelete
reviewMongooseSchema.pre<QueryWithDocument<IReview>>(
  /^findOneAnd/,
  async function (next) {
    this.r = await this.model.findOne(this.getQuery());
    next();
  },
);

// Post-middleware for findOneAndUpdate and findOneAndDelete
reviewMongooseSchema.post<QueryWithDocument<IReview>>(
  /^findOneAnd/,
  async function () {
    if (this.r) {
      await (this.r.constructor as IReviewModel).calcAverageRatings(
        this.r.tour,
      );
    }
  },
);

// Export the review model
const Review: IReviewModel = mongoose.model<IReview, IReviewModel>(
  'Review',
  reviewMongooseSchema,
);

export { IReview, Review, reviewKeys, reviewSchema };
