import { NextFunction, Request, Response } from 'express';

import { Review, reviewKeys } from '@/models/reviewModel';
import factory from './handlerFactory';

/*
const getAllReviews = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let filter = {};
      if (req.params.tourId) {
        filter = { tour: req.params.tourId };
      }

      const features = new APIFeatures<IReview>(
        Review.find(filter),
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
    } catch (error) {
      next(error);
    }
  },
);


const createReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Allow nested routes
      if (!req.body.tour) req.body.tour = req.params.tourId;
      if (!req.body.user) req.body.user = req.user?.id;

      const newReview = await Review.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          review: newReview,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
*/

const setTourUserIds = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // All nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user?.id;
  next();
};

const getAllReviews = factory.getAll(Review, reviewKeys, 'reviews');
const getReview = factory.getOne(Review, undefined, 'review');
const createReview = factory.createOne(Review, 'review');
const updateReview = factory.updateOne(Review, 'review');
const deleteReview = factory.deleteOne(Review);

const reviewController = {
  getAllReviews,
  getReview,
  setTourUserIds,
  createReview,
  updateReview,
  deleteReview,
};

export default reviewController;
