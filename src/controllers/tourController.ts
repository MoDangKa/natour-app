import { tourFields } from '@/middlewares/validationTourMiddleware';
import Tour from '@/models/tourModel';
import apiErrorHandler from '@/utils/apiErrorHandler';
import { Request, Response } from 'express';

export const getAllTours = async (req: Request, res: Response) => {
  let queryFields: { [key: string]: any } = {};
  let sortBy = '-createdAt';
  let selectedFields = '-__v';
  let page = 1;
  let limit = 100;

  if (Object.keys(req.query).length) {
    const filteredFields: { [key: string]: any } = {};

    tourFields.forEach((field) => {
      if (req.query[field]) {
        filteredFields[field] = req.query[field];
      }
    });

    if (Object.keys(filteredFields).length) {
      let fieldsStr = JSON.stringify(filteredFields);
      fieldsStr = fieldsStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      );
      queryFields = JSON.parse(fieldsStr);
    }

    if (req.query.sort) {
      sortBy = (req.query.sort as string).split(',').join(' ');
    }

    if (req.query.fields) {
      selectedFields = (req.query.fields as string).split(',').join(' ');
    }

    if (req.query.page) {
      page = parseInt(req.query.page as string, 10) || 1;
    }

    if (req.query.limit) {
      limit = parseInt(req.query.limit as string, 10) || 100;
    }
  }

  const skip = (page - 1) * limit;

  const numTours = await Tour.countDocuments();
  if (skip >= numTours) {
    const errorMessage = 'This page does not exist';
    return apiErrorHandler(req, res, 404, errorMessage);
  }

  const tours = await Tour.find(queryFields)
    .sort(sortBy)
    .select(selectedFields)
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
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
    return apiErrorHandler(req, res, 404, errorMessage);
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
    return apiErrorHandler(req, res, 404, errorMessage);
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
    return apiErrorHandler(req, res, 404, errorMessage);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
