import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

export const displayLeafletMap = (locations) => {
  if (typeof L === 'undefined') {
    console.error('Leaflet is not loaded');
    return;
  }

  console.log('Leaflet script loaded.');
  console.log('Locations data:', locations);

  if (!locations || locations.length === 0) {
    console.error('No valid locations data found.');
    return;
  }

  const map = L.map('map').setView([0, 0], 2);
  console.log('map: ', map);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution:
  //       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //   }).addTo(map);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const bounds = L.latLngBounds();

  locations.forEach((loc) => {
    const marker = L.marker(loc.coordinates).addTo(map);
    marker.bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`).openPopup();
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: [50, 50],
  });
};
