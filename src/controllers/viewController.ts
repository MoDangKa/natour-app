import { NextFunction, Request, Response } from 'express';

const getOverview = (req: Request, res: Response) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'Jonas',
  });
};

const viewController = {
  getOverview,
};

export default viewController;
