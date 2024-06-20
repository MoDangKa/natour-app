import mongoose, { Document, Model, Query, Schema } from 'mongoose';
import slugify from 'slugify';

type TDifficulty = 'easy' | 'medium' | 'difficult';

interface ITour extends Document {
  name: string;
  slug: string; // DOCUMENT MIDDLEWARE
  duration: number;
  maxGroupSize: number;
  difficulty: TDifficulty;
  price: number;
  priceDiscount?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  summary?: string;
  description: string;
  imageCover: string;
  images?: string[];
  startDates?: Date[];
  secretTour?: boolean;
  createdAt?: Date;
  durationWeeks?: number;
  startLocation?: {
    type: 'Point';
    coordinates: number[];
    address: string;
    description: string;
  };
  locations?: {
    type: 'Point';
    coordinates: number[];
    address: string;
    description: string;
    day: number;
  }[];
}

type ITourKeys = keyof ITour;

const tourKeys: ITourKeys[] = [
  'name',
  'slug', // DOCUMENT MIDDLEWARE
  'duration',
  'maxGroupSize',
  'difficulty',
  'price',
  'priceDiscount',
  'ratingsAverage',
  'ratingsQuantity',
  'summary',
  'description',
  'imageCover',
  'images',
  'startDates',
  'secretTour',
  'createdAt',
  'durationWeeks',
  'startLocation',
  'locations',
];

const locationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: String,
    description: String,
    day: Number,
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
      },
    },
  },
);

const tourSchema = new mongoose.Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
    },
    slug: String, // DOCUMENT MIDDLEWARE
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      default: 0,
      min: [0, 'Max group size must be a positive number'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'] as TDifficulty[],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Ratings quantity must be a positive number'],
    },
    summary: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
      default: [],
    },
    startDates: {
      type: [Date],
      default: [],
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [locationSchema],
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
    collection: 'tours',
    timestamps: true,
  },
);

tourSchema.virtual<ITour>('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSchema.pre<ITour>('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/*
tourSchema.pre('save', function (next) {
  // For refer
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function (doc, next) {
  // For refer
  console.log('doc: ', doc);
  next();
});
*/
tourSchema.pre<Query<any, ITour>>(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  (this as any).start = Date.now();
  next();
});

tourSchema.post<Query<any, ITour>>(/^find/, function (doc, next) {
  console.log(
    `Tour query took ${Date.now() - (this as any).start} milliseconds!`,
  );
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  // console.log(this.pipeline());
  next();
});

const Tour: Model<ITour> = mongoose.model<ITour>('Tour', tourSchema);

export { ITour, TDifficulty, Tour, tourKeys };
