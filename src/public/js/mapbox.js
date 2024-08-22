export const displayMap = (locations) => {
  console.log('Mapbox script loaded.');
  console.log('Locations data:', locations);

  if (!locations || locations.length === 0) {
    console.error('No valid locations data found.');
    return;
  }

  if (typeof mapboxgl === 'undefined') {
    console.error('Mapbox GL JS did not load correctly.');
    return;
  }

  try {
    mapboxgl.accessToken =
      'pk.eyJ1IjoicG95c2lhbjMwOSIsImEiOiJjbHpjNHBxNGowN3YwMmlwd2s0N3ZicTZwIn0.12403CN-2niO08iRcy4uxw';

    const map = new mapboxgl.Map({
      container: 'map-box',
      style: 'mapbox://styles/mapbox/streets-v11',
      // style: 'mapbox://styles/poysian309/clzchvhue009v01qtgz2p7yf7',
      scrollZoom: false,
      center: locations[0].coordinates, // Center on the first location
      zoom: 6, // Set an initial zoom level
    });

    map.on('load', function () {
      console.log('Map loaded successfully');
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
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
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
    console.error('Error initializing map:', error);
  }
};
