import './App.css'
import React, { useRef, useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react';
import { Marker } from './Marker';
import Popover from '@mui/material/Popover';
import { styled } from '@mui/system';
import Drawer from "./Drawer";

import { FilterContext } from './filterContext';

const PopupBody = styled('div')(
  ({ theme }) => `
  width: max-content;
  padding: 12px 16px;
  margin: 8px;
  border-radius: 8px;
  background-color: #fff;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 500;
  font-size: 0.875rem;
  z-index: 1;
`,
);

function AnimalPopover(props) {
  const { anchorEl, handleClose, animal } = props;
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
    >
      <PopupBody>
        <h2>{animal.animal_type}</h2>
        <p><b>Zachowanie</b>: {animal.behaviour}</p>
      </PopupBody>
    </Popover>
  );
}

function GoogleMapComponent() {
  const lng = 19.95;
  const lat = 50.05;
  const initialZoom = 13;

  const [zoom, setZoom] = useState(initialZoom);
  const [data, setData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [animal, setAnimal] = useState({});

  const filterContext = React.useContext(FilterContext);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    const uniqueAnimals = data.reduce((acc, curr) => {
      if (!acc[curr.animal_type]) {
        acc[curr.animal_type] = true;
      }
      return acc;
    }, {});

    filterContext.setUniqueAnimals(Object.keys(uniqueAnimals));

    setMarkers(data.map((marker, index) => {
      const key = `marker-${index}`;

      const element = (
        <Marker
          key={key}
          lng={marker.location_lon}
          lat={marker.location_lat}
          zoom={zoom}
          type={marker.animal_type}
          onClick={(e) => {
            setAnimal(marker);
            filterContext.setCurrentAnimal(marker.animal_type);
            handleClick(e);
          }}
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
      <AnimalPopover
        anchorEl={anchorEl}
        handleClose={handleClose}
        animal={animal}
      />
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
        onClick={() => {
          handleClose();
        }}
        yesIWantToUseGoogleMapApiInternals
        options={() => {
          return {
            gestureHandling: 'greedy' // Will capture all touch events on the map towards map panning
          }
        }}
      >
        {markers}
      </GoogleMapReact>
    </div>
  )
}

function App() {
  return (
    <Drawer>
      <GoogleMapComponent />
    </Drawer>
  )
}

export default App
