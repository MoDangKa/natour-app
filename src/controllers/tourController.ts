import { tourFields } from '@/middlewares/validationTourMiddleware';
import { Tour, type ITour } from '@/models/tourModel';
import APIErrorHandler from '@/utils/apiErrorHandler';
import APIFeatures from '@/utils/apiFeatures';
import { NextFunction, Request, Response } from 'express';

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    Object.assign(req.query, {
      limit: '5',
      sort: '-ratingsAverage,price',
      fields: 'name,price,ratingsAverage,summary,difficulty',
    });
    next();
  } catch (error) {
    next(error);
  }
};

export const getAllTours = async (req: Request, res: Response) => {
  const features = new APIFeatures<ITour>(Tour.find(), req.query, tourFields)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const response = await features.getResults();

  if (response.errorMessage) {
    return APIErrorHandler(req, res, 404, response.errorMessage);
  }

  res.status(200).json({
    status: 'success',
    results: response.resultsLength,
    data: {
      tours: response.data,
      page: response.page,
      totalPages: response.totalPages,
      limit: response.limit,
    },
  });
};

export const createTour = async (req: Request, res: Response) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tour: newTour } });
};

export const getTourById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const tour = await Tour.findById(id);

  if (!tour) {
    const errorMessage = `Tour with ID ${id} not found`;
    return APIErrorHandler(req, res, 404, errorMessage);
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

export const updateTourById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    const errorMessage = `Tour with ID ${id} not found`;
    return APIErrorHandler(req, res, 404, errorMessage);
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

export const deleteTourById = async (req: Request, res: Response) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    const errorMessage = `Tour with ID ${id} not found`;
    return APIErrorHandler(req, res, 404, errorMessage);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const getTourStats = async (req: Request, res: Response) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
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
    {
      $sort: { avgPrice: 1 },
    },
    { $match: { _id: { $ne: 'EASY' } } },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
};
