import { tourSchema } from '@/schemas/tourSchema';
import mongoose from 'mongoose';

export const Tour = mongoose.model('tour', tourSchema);
