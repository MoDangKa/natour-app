import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log({ email, password });
  try {
    const { data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signin',
      data: { email, password },
    });
    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response?.data?.message || 'An error occurred');
  }
};

export const logout = async () => {
  try {
    const { data } = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/sign-out',
    });
    if (data.status === 'success') {
      location.reload(true);
    }
  } catch (error) {
    console.log('error: ', error?.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};
