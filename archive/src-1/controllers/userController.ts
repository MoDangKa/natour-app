import { Tour } from '@/interfaces/tour';
import { User } from '@/interfaces/user';
import { readFile, writeFile } from '@/utils/fileHelper';
import { Request, Response } from 'express';

const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).json({ status: 'failed', message });
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await readFile<User[]>('users.json');
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users },
    });
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, 400, error.message);
    }
    sendErrorResponse(res, 500, 'Internal Server Error');
  }
};
/*
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      duration,
      maxGroupSize,
      difficulty,
      ratingsAverage,
      ratingsQuantity,
      price,
      summary,
      description,
      imageCover,
      images,
      startDates,
    } = req.body;

    if (!name) {
      return sendErrorResponse(res, 400, 'Name is required');
    }

    const users = await readFile<User[]>('users.json');
    const newId = users.length > 0 ? users[users.length - 1].id + 1 : 1;

    const newUser: Tour = {
      id: newId,
      name,
      duration,
      maxGroupSize,
      difficulty,
      ratingsAverage,
      ratingsQuantity,
      price,
      summary,
      description,
      imageCover,
      images,
      startDates,
    };

    users.push(newUser);
    await writeFile<Tour>(
      'users.json',
      users.sort((a, b) => a.id - b.id)
    );

    res.status(201).json({
      status: 'success',
      data: { tour: newUser },
    });
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, 400, error.message);
    }
    sendErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return sendErrorResponse(res, 400, 'Invalid tour ID');
    }

    const users = await readFile<User[]>('users.json');
    const tour = users.find((el) => el.id === id);

    if (!tour) {
      return sendErrorResponse(res, 404, `Tour with ID ${id} not found`);
    }

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, 400, error.message);
    }
    sendErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const updateUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return sendErrorResponse(res, 400, 'Invalid tour ID');
    }

    const users = await readFile<User[]>('users.json');
    const index = users.findIndex((el) => el.id === id);

    if (index === -1) {
      return sendErrorResponse(res, 404, `Tour with ID ${id} not found`);
    }

    const {
      name,
      duration,
      maxGroupSize,
      difficulty,
      ratingsAverage,
      ratingsQuantity,
      price,
      summary,
      description,
      imageCover,
      images,
      startDates,
    } = req.body;

    const updatedTour: User = {
      ...users[index],
      name: name ?? users[index].name,
      duration: duration ?? users[index].duration,
      maxGroupSize: maxGroupSize ?? users[index].maxGroupSize,
      difficulty: difficulty ?? users[index].difficulty,
      ratingsAverage: ratingsAverage ?? users[index].ratingsAverage,
      ratingsQuantity: ratingsQuantity ?? users[index].ratingsQuantity,
      price: price ?? users[index].price,
      summary: summary ?? users[index].summary,
      description: description ?? users[index].description,
      imageCover: imageCover ?? users[index].imageCover,
      images: images ?? users[index].images,
      startDates: startDates ?? users[index].startDates,
    };

    users[index] = updatedTour;
    await writeFile<Tour>(
      'users.json',
      users.sort((a, b) => a.id - b.id)
    );

    res.status(200).json({
      status: 'success',
      data: { tour: updatedTour },
    });
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, 400, error.message);
    }
    sendErrorResponse(res, 500, 'Internal Server Error');
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return sendErrorResponse(res, 400, 'Invalid tour ID');
    }

    const users = await readFile('users.json');
    const tour = users.find((el) => el.id === id);

    if (!tour) {
      return sendErrorResponse(res, 404, `Tour with ID ${id} not found`);
    }

    const updatedTours = users.filter((el) => el.id !== id);
    await writeFile<Tour>(
      'users.json',
      updatedTours.sort((a, b) => a.id - b.id)
    );

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    if (error instanceof Error) {
      return sendErrorResponse(res, 400, error.message);
    }
    sendErrorResponse(res, 500, 'Internal Server Error');
  }
};
*/
