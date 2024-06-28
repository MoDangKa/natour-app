import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Document, Model } from 'mongoose';

import { PopOptions } from '@/@types/types';
import APIFeatures from '@/utils/apiFeatures';
import CustomError from '@/utils/customError';

const deleteOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new CustomError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: null,
    });
  });

const updateOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new CustomError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = <T extends Document>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        date: newDoc,
      },
    });
  });

const getOne = <T extends Document>(Model: Model<T>, popOptions?: PopOptions) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new CustomError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getAll = <T extends Document>(Model: Model<T>, keys: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures<T>(Model.find(), req.query, keys)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const response = await features.getResults();

    if (response.error) {
      return next(new CustomError(response.error, 404));
    }

    const { data = [], page, totalPages, limit, resultsLength } = response;
    const hidePagination = req.query.pagination === '0';

    res.status(200).json({
      status: 'success',
      results: resultsLength,
      data: {
        data: data,
        ...(!hidePagination && { page, totalPages, limit }),
      },
    });
  });

const factory = { deleteOne, updateOne, createOne, getOne, getAll };

export default factory;
