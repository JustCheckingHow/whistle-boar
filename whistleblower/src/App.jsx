import './App.css'
import React, { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1Ijoid3d5ZG1hbnNraSIsImEiOiJjazlrOXBucHQwZjhvM2dwOGhldnRpdnU1In0.JJ4N2_IsC1DlL-htctK27w';

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-70.9);
  const [lat, setLat] = useState(42.35);
  const [zoom, setZoom] = useState(9);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
      });

    map.on('load', function () {
        map.resize();
    });
  }, [lat, lng, zoom]);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
    }}>
      <div ref={mapContainer} className="map-container" />
    </div>
  )
}

export default App
