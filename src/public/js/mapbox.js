document.addEventListener('DOMContentLoaded', () => {
  if (typeof mapboxgl === 'undefined') {
    console.error('Mapbox GL JS did not load correctly.');
    return;
  }

  console.log('Mapbox script loaded.');

  const mapElement = document.getElementById('map');

  if (!mapElement) {
    console.error('Map element not found.');
    return;
  }

  const locationsData = mapElement.dataset.locations;

  if (!locationsData) {
    console.error('No locations data found in map element.');
    return;
  }

  let locations = [];

  try {
    locations = JSON.parse(locationsData);
  } catch (error) {
    console.error('Error parsing locations data: ', error);
    return; // Exit if there's an error parsing the locations data.
  }

  if (locations.length === 0) {
    console.error('No locations found in the dataset.');
    return; // Exit if no locations are found.
  }

  try {
    mapboxgl.accessToken =
      'pk.eyJ1IjoicG95c2lhbjMwOSIsImEiOiJjbHpjNHBxNGowN3YwMmlwd2s0N3ZicTZwIn0.12403CN-2niO08iRcy4uxw';
    // 'pk.eyJ1IjoicG95c2lhbjMwOSIsImEiOiJjbHpjNTZweHAwYTBjMmxzNnI3MzQ4MjhhIn0.5gk2wURy_7AgPL7y3400CA';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      // style: 'mapbox://styles/poysian309/clzchvhue009v01qtgz2p7yf7',
      scrollZoom: false,
    });

    map.on('style.load', function () {
      console.log('Style loaded successfully');
    });

    map.on('error', function (e) {
      console.error('Mapbox GL Error:', e);
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'marker';

      new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat(loc.coordinates)
        .addTo(map);

      new mapboxgl.Popup({ offset: 30 })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.coordinates}</p>`)
        .addTo(map);

      bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100,
      },
    });
  } catch (error) {
    console.error('Error parsing locations data: ', error);
  }
});
