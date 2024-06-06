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
  // const id = parseInt(req.params.id, 10);

  // const tours = await readFile<TTour[]>('tours-simple.json');
  // const index = tours.findIndex((el) => el.id === id);

  // if (index === -1) {
  //   const errorMessage = `TTour with ID ${id} not found`;
  //   return handleApiError(req, res, 404, errorMessage);
  // }

  // const {
  //   name,
  //   duration,
  //   maxGroupSize,
  //   difficulty,
  //   ratingsAverage,
  //   ratingsQuantity,
  //   price,
  //   summary,
  //   description,
  //   imageCover,
  //   images,
  //   startDates,
  // } = req.body;

  // const updatedTour: TTour = {
  //   ...tours[index],
  //   name: name ?? tours[index].name,
  //   duration: duration ?? tours[index].duration,
  //   maxGroupSize: maxGroupSize ?? tours[index].maxGroupSize,
  //   difficulty: difficulty ?? tours[index].difficulty,
  //   ratingsAverage: ratingsAverage ?? tours[index].ratingsAverage,
  //   ratingsQuantity: ratingsQuantity ?? tours[index].ratingsQuantity,
  //   price: price ?? tours[index].price,
  //   summary: summary ?? tours[index].summary,
  //   description: description ?? tours[index].description,
  //   imageCover: imageCover ?? tours[index].imageCover,
  //   images: images ?? tours[index].images,
  //   startDates: startDates ?? tours[index].startDates,
  // };

  // tours[index] = updatedTour;
  // await writeFile<TTour[]>(
  //   'tours-simple.json',
  //   tours.sort((a, b) => a.id - b.id),
  // );

  res.status(200).json({
    status: 'success',
    data: {},
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
