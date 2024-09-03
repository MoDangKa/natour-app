/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripePublicKey =
  'pk_test_51PuXetRxeacq9AYDKvGapuiQ1KYnk4OqjOZlhhqxhkWPLJU7Bagr8QU6U9TRcJ63K2aEV76kcsLHp2OuRwYVPACM00R1k737o8';
const stripe = Stripe(stripePublicKey);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const { status, data } = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    });

    if (status !== 200) {
      throw new Error('Failed to get checkout session');
    }

    // 2) Redirect to stripe checkout
    await stripe.redirectToCheckout({
      sessionId: data.session.id,
    });
  } catch (error) {
    console.error('Error booking tour:', error);
    showAlert(
      'error',
      error.message || 'There was an error processing your request.',
    );
  }
};
