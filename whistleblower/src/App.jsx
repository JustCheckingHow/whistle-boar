import './App.css'
import React, { useRef, useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react';
import stc from "string-to-color";

const Marker = (props) => {
  const [hovered, setHovered] = useState(false);
  const color = stc(props.type);

  const RADIUS_MAP = {
    15: 50,
    14: 40,
    13: 30,
    12: 20,
    11: 10,
    10: 5,
  }

  React.useEffect(() => {
    setHovered(props['$hover']);
  }, [props['$hover']]);

  return <div
    className="animal-marker"
    style={{
      backgroundColor: hovered ? 'red' : color,
      borderColor: hovered ? 'red' : color,
      width: `${RADIUS_MAP[props.zoom]}px`,
      height: `${RADIUS_MAP[props.zoom]}px`,
    }}
  >
  </div>
}

function App() {
  const lng = 19.95;
  const lat = 50.05;
  const initialZoom = 13;

  const [zoom, setZoom] = useState(initialZoom);
  const [data, setData] = useState([]);
  const [markers, setMarkers] = useState([]);

  const fetchData = async () => {
    setData([]);
    fetch(`${import.meta.env.VITE_ROOT_API}/data`)
    .then(response => response.json())
    .then(data => {
      // add mapbox markers
      data.forEach((marker) => {
        setData((current) => [...current, marker]);
      });
    });
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setMarkers(data.map((marker, index) => {
      const key = `marker-${index}`;

      const element = (
        <Marker 
          key={key} 
          lng={marker.location_lon} 
          lat={marker.location_lat} 
          zoom={zoom} 
          type={marker.animal_type}
          />
      );

      return element;
      }));
    }, [data, zoom]);


  return (
    <div style={{
      height: '100vh',
      width: '100vw',
    }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: import.meta.env.VITE_GOOGLE_KEY }}
        defaultCenter={{
          lat: lat,
          lng: lng
        }}
        defaultZoom={initialZoom}
        onChange={(e) => {
          setZoom(e.zoom);
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        {markers}
      </GoogleMapReact>
    </div>
  )
}

export default App
