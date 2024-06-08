import { TTour } from '@/interfaces/tour';
import { handleApiError } from '@/utils/controllerHelper';
import { readFile, writeFile } from '@/utils/fileHelper';
import { Request, Response } from 'express';
import Tour from  "@/models/tourModel"

const TOURS_FILE_PATH = 'tours-simple.json';

export const getAllTours = async (req: Request, res: Response) => {
  const tours = await readFile<TTour[]>(TOURS_FILE_PATH);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours: tours.sort((a, b) => a.id - b.id) },
  });
};

export const createTour = async (req: Request, res: Response) => {
  const { ...rest } = req.body;

  const tours = await readFile<TTour[]>(TOURS_FILE_PATH);
  const newId = tours.length > 0 ? tours[tours.length - 1].id + 1 : 1;

  const newTour: TTour = { id: newId, ...rest };

  tours.push(newTour);
  await writeFile<TTour[]>(TOURS_FILE_PATH, tours);

  res.status(201).json({ status: 'success', data: { tour: newTour } });
};

export const getTourById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const tours = await readFile<TTour[]>('tours-simple.json');
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    const errorMessage = `TTour with ID ${id} not found`;
    return handleApiError(req, res, 404, errorMessage);
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
};

export const updateTourById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const tours = await readFile<TTour[]>('tours-simple.json');
  const index = tours.findIndex((el) => el.id === id);

  if (index === -1) {
    const errorMessage = `TTour with ID ${id} not found`;
    return handleApiError(req, res, 404, errorMessage);
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

  const updatedTour: TTour = {
    ...tours[index],
    name: name ?? tours[index].name,
    duration: duration ?? tours[index].duration,
    maxGroupSize: maxGroupSize ?? tours[index].maxGroupSize,
    difficulty: difficulty ?? tours[index].difficulty,
    ratingsAverage: ratingsAverage ?? tours[index].ratingsAverage,
    ratingsQuantity: ratingsQuantity ?? tours[index].ratingsQuantity,
    price: price ?? tours[index].price,
    summary: summary ?? tours[index].summary,
    description: description ?? tours[index].description,
    imageCover: imageCover ?? tours[index].imageCover,
    images: images ?? tours[index].images,
    startDates: startDates ?? tours[index].startDates,
  };

  tours[index] = updatedTour;
  await writeFile<TTour[]>(
    'tours-simple.json',
    tours.sort((a, b) => a.id - b.id)
  );

  res.status(200).json({
    status: 'success',
    data: { tour: updatedTour },
  });
};

export const deleteTourById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  const tours = await readFile<TTour[]>('tours-simple.json');
  const tour = tours.find((el) => el.id === id);

  if (!tour) {
    const errorMessage = `TTour with ID ${id} not found`;
    return handleApiError(req, res, 404, errorMessage);
  }

  const updatedTours = tours.filter((el) => el.id !== id);
  await writeFile<TTour[]>(
    'tours-simple.json',
    updatedTours.sort((a, b) => a.id - b.id)
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
};
