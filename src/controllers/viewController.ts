import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { Tour } from '@/models/tourModel';
import CustomError from '@/utils/customError';

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
      // return res.redirect('/');
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

const updateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Updating user', req.body);
  // res.status(200).render('account', {
  //   title: 'Your account',
  //   user: req.user,
  // });
};

const viewController = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
};

export default viewController;
