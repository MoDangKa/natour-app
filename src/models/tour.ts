import mongoose, { Document, Model } from 'mongoose';

type Difficulty = 'easy' | 'moderate' | 'difficult';

interface ITour extends Document {
  name: string;
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
  startDates?: string[];
  createdAt?: Date;
}

type ITourKeys = keyof ITour;

const tourKeys: ITourKeys[] = [
  'name',
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
  'createdAt',
];

const tourSchema = new mongoose.Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
    },
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
      enum: ['easy', 'moderate', 'difficult'] as Difficulty[],
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
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { collection: 'tours' },
);

const Tour: Model<ITour> = mongoose.model<ITour>('Tour', tourSchema);

export { Tour, ITour, tourKeys };
