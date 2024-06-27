import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Model } from 'mongoose';

import CustomError from '@/utils/customError';

const deleteOne = (Model: Model<any>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new CustomError('No Document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

const factory = { deleteOne };

export default factory;
