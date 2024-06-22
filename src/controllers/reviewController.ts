import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { IReview, Review, reviewKeys } from '@/models/reviewModel';
import APIFeatures from '@/utils/apiFeatures';
import CustomError from '@/utils/customError';

export const getAllReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IReview>(
      Review.find(),
      req.query,
      reviewKeys,
    )
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
        reviews: data,
        ...(!hidePagination && { page, totalPages, limit }),
      },
    });
  },
);

export const createReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  },
);
