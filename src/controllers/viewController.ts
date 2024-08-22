import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { Tour } from '@/models/tourModel';

const getOverview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tours = await Tour.find();

    res
      .status(200)
      .render('overview', {
        title: 'All Tour',
        tours,
      });
  },
);

const getTour = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      select: 'review rating user',
    });

    if (!tour) {
      return res.redirect('/');
    }

    res
      .status(200)
      .set(
        'Content-Security-Policy',
        "default-src 'self' https:; " +
          "script-src 'self' 'unsafe-inline' https://api.mapbox.com; " +
          "style-src 'self' 'unsafe-inline' https:; " +
          "img-src 'self' data: https:; " +
          "font-src 'self' https:; " +
          "connect-src 'self' https://api.mapbox.com https://*.tiles.mapbox.com https://events.mapbox.com; " +
          'worker-src blob:;',
      )
      .render('tour', {
        title: `${tour.name} Tour`,
        tour,
      });
  },
);

const getLoginForm = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .status(200)
      // .set('Content-Type', 'application/javascript')
      .render('login', {
        title: 'Log into your account',
      });
  },
);

const viewController = {
  getOverview,
  getTour,
  getLoginForm,
};

export default viewController;
