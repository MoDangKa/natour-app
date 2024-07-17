import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { Tour } from '@/models/tourModel';

const getOverview = asyncHandler(async (req: Request, res: Response) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tour',
    tours,
  });
});

const getTour = asyncHandler(async (req: Request, res: Response) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) {
    return res.redirect('/');
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

const viewController = {
  getOverview,
  getTour,
};

export default viewController;
