import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { ITour, Tour, tourKeys } from '@/models/tourModel';
import CustomError from '@/utils/customError';
import factory from './handlerFactory';

const aliasTopTours = (req: Request, res: Response, next: NextFunction) => {
  Object.assign(req.query, {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
    pagination: '0',
  });
  next();
};

/*
const getAllTours = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures<ITour>(Tour.find(), req.query, tourKeys)
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
        tours: data,
        ...(!hidePagination && { page, totalPages, limit }),
      },
    });
  },
);

const getTour = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
      return next(new CustomError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  },
);


const createTour = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  },
);

const updateTour = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return next(new CustomError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  },
);

const deleteTour = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
      return next(new CustomError('No tour found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);
*/

const getAllTours = factory.getAll<ITour>(Tour, tourKeys);
const getTour = factory.getOne(Tour, { path: 'reviews' });
const createTour = factory.createOne(Tour);
const updateTour = factory.updateOne(Tour);
const deleteTour = factory.deleteOne(Tour);

const getTourStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { avgPrice: 1 } },
    ]);

    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  },
);

const getMonthlyPlan = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = parseInt(req.params.year) || new Date().getFullYear();
    const plan = await Tour.aggregate([
      { $unwind: '$startDates' },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      { $addFields: { month: '$_id' } },
      { $project: { _id: 0 } },
      { $sort: { month: 1 } },
      { $limit: 12 },
    ]);

    if (!plan || plan.length === 0) {
      return next(new CustomError(`Plan with year ${year} not found`, 404));
    }

    const defaultPlan = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      numTourStarts: 0,
      tours: [],
    }));

    plan.forEach(({ month, numTourStarts, tours }) => {
      defaultPlan[month - 1] = { month, numTourStarts, tours };
    });

    res.status(200).json({
      status: 'success',
      data: { plan: defaultPlan },
    });
  },
);

const tourController = {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
};

export default tourController;
