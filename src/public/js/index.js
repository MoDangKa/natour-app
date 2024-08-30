import '@babel/polyfill';

import { login, logout } from './auth';
import { displayMap } from './mapbox';
import { updateSetting } from './updateSetting';

console.log('Hello form Parcel');

const mapBox = document.getElementById('mapBox');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    login(email, password);
  });
}

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', function () {
    window.location.href = '/login';
  });
}

const logOutBtn = document.getElementById('logOutBtn');
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

const userPhoto = document.getElementById('userPhoto');
const imgElement = document.getElementById('imagePreview');
if (userPhoto && imgElement) {
  userPhoto.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      imgElement.src = imageUrl;
    }
  });
}

const updateUserInfoForm = document.getElementById('updateUserInfoForm');
const btnSaveSetting = document.getElementById('btnSaveSetting');
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
  'updateUserPasswordForm',
);
const btnSavePassword = document.getElementById('btnSavePassword');
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
