import { IUser, User, userKeys } from '@/models/user';
import APIFeatures from '@/utils/apiFeatures';
import CustomError from '@/utils/customError';
import { filterObj } from '@/utils/utils';
import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

export const updateMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const filteredBody = filterObj(req.body, 'name', 'email', 'role', 'photo');

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const getAllUsers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IUser>(User.find(), req.query, userKeys)
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
        users: data,
        ...(!hidePagination && { page, totalPages, limit }),
      },
    });
  },
);

export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  },
);

export const getUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(new CustomError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  },
);

export const updateUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  },
);

export const deleteUserById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  },
);
