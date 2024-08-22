import axios from 'axios';

export const login = async (email, password) => {
  console.log({ email, password });
  try {
    const { data } = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signin',
      data: { email, password },
    });
    if (data.status === 'success') {
      alert('Logged in successfully!');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    alert(error.response.data.message);
  }
};
