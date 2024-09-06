import { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Stripe from 'stripe';

import { STRIPE_SECRET_KEY } from '@/config';
import { Booking, IBooking, requireBookingKeys } from '@/models/bookingModel';
import { Tour } from '@/models/tourModel';
import CustomError from '@/utils/customError';
import factory from './handlerFactory';

// Ensure STRIPE_SECRET_KEY is defined and is a secret key
if (!STRIPE_SECRET_KEY || !STRIPE_SECRET_KEY.startsWith('sk_')) {
  throw new Error('Invalid or missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const getCheckoutSession = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    if (!tour) {
      return next(new CustomError('No tour found with that ID', 404));
    }

    // 2) Create checkout session
    const baseURL = `${req.protocol}://${req.get('host')}`;
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${baseURL}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${baseURL}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(Number(tour.price) * 100),
              product_data: {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                  `https://www.natours.dev/img/tours/${tour.imageCover}`, // for development
                ],
              },
            },
            quantity: 1,
          },
        ],
      });

      // 3) Send session as response
      res.status(200).json({ status: 'success', session });
    } catch (error) {
      console.error('Stripe API Error:', error);
      if (error instanceof Stripe.errors.StripeError) {
        return next(new CustomError(`Stripe Error: ${error.message}`, 500));
      }
      return next(new CustomError('Error creating checkout session', 500));
    }
  },
);

const createBookingCheckout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying

    const { tour, user, price } = req.query;
    if (!tour || !user || !price) return next();
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
  },
);

const createBooking = factory.createOne(Booking, 'bookings');
const getBooking = factory.getOne(Booking, undefined, 'bookings');
const getAllBookings = factory.getAll<IBooking>(
  Booking,
  requireBookingKeys,
  'bookings',
);
const updateBooking = factory.updateOne(Booking, 'bookings');
const deleteBooking = factory.deleteOne(Booking);

const bookingController = {
  getCheckoutSession,
  createBookingCheckout,
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
};

export default bookingController;
