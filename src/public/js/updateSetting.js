import axios from 'axios';
import { showAlert } from './alerts';

export const updateSetting = async (formData, type) => {
  console.log('formData: ', formData);
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const { data } = await axios({
      method: 'PATCH',
      url,
      data: formData,
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (error) {
    showAlert(
      'error',
      error.response?.data?.message || 'Error updating data! Try again.',
    );
  }
};
