import '@babel/polyfill';

import { login } from './login';
import { displayMap } from './mapbox';

console.log('Hello form Parcel');

const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

const loginForm = document.querySelector('.form');
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    login(email, password);
  });
}

document.getElementById('loginBtn').addEventListener('click', function () {
  window.location.href = '/login';
});
