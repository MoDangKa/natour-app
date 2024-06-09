import mongoose, { Document, Model, Query } from 'mongoose';
import slugify from 'slugify';

type Difficulty = 'easy' | 'medium' | 'difficult';

interface ITour extends Document {
  name: string;
  slug: string; // 139
  duration: number;
  maxGroupSize: number;
  difficulty: Difficulty;
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
];

const tourSchema = new mongoose.Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
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
      enum: ['easy', 'medium', 'difficult'] as Difficulty[],
      required: [true, 'A tour must have a difficulty'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
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
  console.log(`Query took ${Date.now() - (this as any).start} milliseconds!`);
  next();
});

const Tour: Model<ITour> = mongoose.model<ITour>('Tour', tourSchema);

export { Tour, ITour, tourKeys };
