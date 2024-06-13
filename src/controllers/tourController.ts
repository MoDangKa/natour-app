import { ITour, Tour, tourKeys } from '@/models/tour';
import APIFeatures from '@/utils/apiFeatures';
import CustomError from '@/utils/customError';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  Object.assign(req.query, {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
    pagination: '0',
  });
  next();
};

export const getAllTours = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures<ITour>(Tour.find(), req.query, tourKeys)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const response = await features.getResults();

    if (response.errorMessage) {
      return next(new CustomError(response.errorMessage, 404));
    }

    const { data = [], page, totalPages, limit, resultsLength } = response;

    const pagination = req.query.pagination;
    const hidePagination = pagination === '0';

    const responseData = {
      tours: data,
      ...(!hidePagination && { page, totalPages, limit }),
    };

    res.status(200).json({
      status: 'success',
      results: resultsLength,
      data: responseData,
    });
  },
);

export const createTour = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  },
);

export const getTourById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      const errorMessage = 'Invalid tour ID format';
      return next(new CustomError(errorMessage, 400));
    }

    const tour = await Tour.findById(id);

    if (!tour) {
      const errorMessage = 'No tour found with that ID';
      return next(new CustomError(errorMessage, 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  },
);

export const updateTourById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      const errorMessage = 'Invalid tour ID format';
      return next(new CustomError(errorMessage, 400));
    }

    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      const errorMessage = 'No tour found with that ID';
      return next(new CustomError(errorMessage, 404));
    }

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  },
);

export const deleteTourById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      const errorMessage = 'Invalid tour ID format';
      return next(new CustomError(errorMessage, 400));
    }

    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
      const errorMessage = 'No tour found with that ID';
      return next(new CustomError(errorMessage, 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

export const getTourStats = asyncHandler(
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

export const getMonthlyPlan = asyncHandler(
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
      const errorMessage = `Plan with year ${year} not found`;
      return next(new CustomError(errorMessage, 404));
    }

    const defaultPlan = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      numTourStarts: 0,
      tours: [],
    }));

    plan.forEach(({ month, numTourStarts, tours }) => {
      const monthIndex = month - 1;
      defaultPlan[monthIndex] = { month, numTourStarts, tours };
    });

    res.status(200).json({
      status: 'success',
      data: { plan: defaultPlan },
    });
  },
);
