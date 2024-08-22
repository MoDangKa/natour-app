import '@babel/polyfill';

import { login, logout } from './login';
import { displayMap } from './mapbox';

console.log('Hello form Parcel');

const mapBox = document.getElementById('map-box');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

const loginForm = document.querySelector('.form');
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

const logOutBtn = document.querySelector('.nav__el.nav__el--logout');
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
