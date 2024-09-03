import '@babel/polyfill';

import { login, logout } from './auth';
import { displayMap } from './mapbox';
import { bookTour } from './stripe';
import { updateSetting } from './updateSetting';

console.log('Hello form Parcel');

const mapBox = document.getElementById('mapBox');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    login(email, password);
  });
}

const BTNLogin = document.getElementById('btn-login');
if (BTNLogin) {
  BTNLogin.addEventListener('click', function () {
    window.location.href = '/login';
  });
}

const BTNLogOut = document.getElementById('btn-log-out');
if (BTNLogOut) {
  BTNLogOut.addEventListener('click', logout);
}

const userPhoto = document.getElementById('user-photo');
const imagePreview = document.getElementById('image-preview');
if (userPhoto && imagePreview) {
  userPhoto.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      imagePreview.src = imageUrl;
    }
  });
}

const updateUserInfoForm = document.getElementById('update-user-info-form');
const btnSaveSetting = document.getElementById('btn-save-setting');
if (updateUserInfoForm && btnSaveSetting) {
  updateUserInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSaveSetting.textContent = 'Updating...';
    try {
      const formData = new FormData(updateUserInfoForm);
      await updateSetting(formData, 'data');
      location.reload();
      // btnSaveSetting.textContent = 'Save settings';
    } catch (error) {
      console.error('Error updating settings:', error);
      btnSaveSetting.textContent = 'Error occurred!';
    }
  });
}

const updateUserPasswordForm = document.getElementById(
  'update-user-password-form',
);
const btnSavePassword = document.getElementById('btn-save-password');
if (updateUserPasswordForm && btnSavePassword) {
  updateUserPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSavePassword.textContent = 'Updating...';
    try {
      const formData = new FormData(e.target);
      await updateSetting(formData, 'password');
      updateUserPasswordForm.reset();
      btnSavePassword.textContent = 'Save password';
    } catch (error) {
      console.error('Error updating password:', error);
      btnSaveSetting.textContent = 'Error occurred!';
    }
  });
}

const BTNBookTour = document.getElementById('btn-book-tour');
if (BTNBookTour) {
  console.log('Book Tour');
  BTNBookTour.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}
