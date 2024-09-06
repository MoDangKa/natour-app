import { Schema as ExpressSchema } from 'express-validator';
import mongoose, {
  Document,
  Schema as MongooseSchema,
  Types as MongooseTypes,
  Query,
} from 'mongoose';

interface IBooking extends Document {
  tour: MongooseTypes.ObjectId;
  user: MongooseTypes.ObjectId;
  price: number;
  createdAt?: Date;
  paid?: boolean;
  isPaid(): boolean;
}

type BookingKeys = keyof IBooking;

const requireBookingKeys: BookingKeys[] = ['tour', 'user', 'price'];

const commonBookingKeys: BookingKeys[] = ['createdAt', 'paid'];

const bookingSchema: ExpressSchema = {
  tour: {
    in: ['body'],
    custom: {
      options: (value) => mongoose.isValidObjectId(value),
      errorMessage: 'Tour ID must be a valid ObjectId',
    },
  },
  user: {
    in: ['body'],
    custom: {
      options: (value) => mongoose.isValidObjectId(value),
      errorMessage: 'User ID must be a valid ObjectId',
    },
  },
  price: {
    in: ['body'],
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Price must be a positive number.',
    },
  },
  createdAt: {
    in: ['body'],
    optional: true,
    isISO8601: {
      errorMessage: 'Created date must be a valid ISO 8601 date',
    },
    toDate: true,
  },
  paid: {
    in: ['body'],
    optional: true,
    isBoolean: {
      errorMessage: 'Paid must be a boolean value',
    },
    toBoolean: true,
  },
};

interface IBookingModel extends mongoose.Model<IBooking> {
  bookingExists(tourId: string, userId: string): Promise<boolean>;
}

const bookingMongooseSchema = new MongooseSchema<IBooking, IBookingModel>({
  tour: {
    type: MongooseSchema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!'],
  },
  user: {
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!'],
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.'],
    min: [0, 'Price must be a positive number'],
  },
  createdAt: {
    type: Date,
    default: Date.now, // Note: no parentheses
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingMongooseSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

bookingMongooseSchema.static(
  'bookingExists',
  async function (tourId: string, userId: string): Promise<boolean> {
    const booking = await this.findOne({ tour: tourId, user: userId });
    return !!booking;
  },
);

bookingMongooseSchema.pre<Query<IBooking, IBooking>>(/^find/, function (next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
  next();
});

bookingMongooseSchema.methods.isPaid = function (): boolean {
  return this.paid;
};

bookingMongooseSchema.index({ tour: 1, user: 1 }, { unique: true });

const Booking = mongoose.model<IBooking, IBookingModel>(
  'Booking',
  bookingMongooseSchema,
);

export { Booking, bookingSchema, commonBookingKeys, requireBookingKeys };
