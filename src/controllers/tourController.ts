import Tour from '@/models/tourModel';
import { Request, Response } from 'express';

export const getAllTours = async (req: Request, res: Response) => {
  const tours = await Tour.find();
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
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

export const deleteTourById = async (req: Request, res: Response) => {
  // const id = parseInt(req.params.id, 10);

  // const tours = await readFile<TTour[]>('tours-simple.json');
  // const tour = tours.find((el) => el.id === id);

  // if (!tour) {
  //   const errorMessage = `TTour with ID ${id} not found`;
  //   return handleApiError(req, res, 404, errorMessage);
  // }

  // const updatedTours = tours.filter((el) => el.id !== id);
  // await writeFile<TTour[]>(
  //   'tours-simple.json',
  //   updatedTours.sort((a, b) => a.id - b.id),
  // );

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
