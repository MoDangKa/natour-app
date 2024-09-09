import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { Booking } from '../models/bookingModel';
import { Tour } from '../models/tourModel';
import CustomError from '../utils/customError';

const getOverview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tours = await Tour.find();

    res.status(200).render('overview', {
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
      return next(new CustomError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  },
);

const getLoginForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res?.locals?.user) {
    res.redirect('/');
  }

  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user,
  });
};

const getMyTours = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map((el) => el.tour.id);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
      user: req.user,
    });
  },
);

const viewController = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
};

export default viewController;
