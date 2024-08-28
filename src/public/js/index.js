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

const updateUserInfoForm = document.getElementById('updateUserInfoForm');
if (updateUserInfoForm) {
  updateUserInfoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSetting(formData, 'data');
  });
}

const updateUserPasswordForm = document.getElementById(
  'updateUserPasswordForm',
);
if (updateUserPasswordForm) {
  updateUserPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateSetting(formData, 'password');
    updateUserPasswordForm.reset();
  });
}
