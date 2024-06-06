import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      default: 'easy',
    },
    price: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
  },
  { collection: 'tours' },
);

const Tour = mongoose.model('tour', tourSchema);

export default Tour;
