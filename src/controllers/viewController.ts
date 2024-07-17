import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { Tour } from '@/models/tourModel';

const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    tour: 'All Tour',
    tours,
  });
});

const getTour = (req: Request, res: Response) => {
  res.status(200).render('tour', {
    tour: 'The Forest Hiker Tour',
  });
};

const viewController = {
  getOverview,
  getTour,
};

export default viewController;
