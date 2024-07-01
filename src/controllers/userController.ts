import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { User, userKeys } from '@/models/userModel';
import CustomError from '@/utils/customError';
import { filterObj } from '@/utils/utils';
import factory from './handlerFactory';

const getMe = (req: Request, res: Response, next: NextFunction) => {
  req.params.id = req?.user?.id;
  next();
};

const updateMe = asyncHandler(
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

const deleteMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findByIdAndUpdate(req.user?.id, {
      active: false,
    });

    if (!user) {
      return next(new CustomError('Something went wrong!', 500));
    }

    res.status(201).json({
      status: 'success',
      data: null,
    });
  },
);
/*
const getAllUsers = asyncHandler(
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
*/
const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  },
);

/*
const getUser = asyncHandler(
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

const updateUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'error',
      message: 'This route is not yet defined!',
    });
  },
);
*/

const getAllUsers = factory.getAll(User, userKeys);
const getUser = factory.getOne(User);

// const createUser = factory.createOne(User);

// Do not update passwords with this!
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

const userController = {
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
};

export default userController;
