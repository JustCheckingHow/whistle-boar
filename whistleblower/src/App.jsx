import './App.css'
import React, { useRef, useEffect, useState } from 'react'
import GoogleMapReact from 'google-map-react';
import { Marker } from './Marker';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled } from '@mui/system';
import Drawer from "./Drawer";
import ClearIcon from '@mui/icons-material/Clear';
import Button from '@mui/material/Button';

import { FilterContext } from './filterContext';
import { Modal } from '@mui/base/Modal';
import { Box, createTheme, Stack, ThemeProvider, useTheme } from '@mui/material';

function capitalizeFirstLetter(string) {
  return string?.charAt(0)?.toUpperCase() + string?.slice(1);
}

function AnimalPopover(props) {
  const { open, handleClose, animal } = props;

  const [funFact, setFunFact] = useState("");

  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_ROOT_API}/did_you_know?animal=${animal.animal_type}`)
      .then(response => response.json())
      .then(data => {
        setFunFact(data.response);
      });
  }, [animal]);

  return (
    <StyledModal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-description"
      open={open}
      onClose={handleClose}
      slots={{ backdrop: StyledBackdrop }}
    >
      <Box sx={style}>
        <Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
              backgroundColor: "#0055D3",
              padding: "0 0 0 32px"
            }}>
            <h2 style={{
              color: "white",
              size: "30px",
              fontWeight: "600",
              lineHeight: "36px",
            }}>{capitalizeFirstLetter(animal.animal_type)}</h2>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#0055D3",
                color: "white",
                fontWeight: "600",
                lineHeight: "36px",
                boxShadow: "none",
              }}
              onClick={handleClose}
            >
              <ClearIcon
                onClick={handleClose}
                style={{
                  color: "white",
                  size: "30px",
                  fontWeight: "600",
                  lineHeight: "36px",
                }} />
            </Button>
          </Stack>
          <Box
            sx={{
              padding: "38px 50px 28px 50px",
            }}>
            <Stack
              sx={{
                fontSize: "18px",
              }}
              direction="row"
              justifyContent="space-between">
              <Box>
                <span><b>Kondycja</b>: {animal.condition}</span>
                <p><b>Zachowanie</b>: <span style={{
                  fontStyle: "italic",
                }}>"{animal.behaviour?.replace("<KONIEC>", "")}"</span></p>
              </Box>
              <Stack
                sx={{
                  textAlign: "right"
                }}>
                <span style={{
                  fontWeight: "600",
                  fontSize: "20px",
                  color: "#4F4F4F"
                }}>Stan</span>
                <span
                  style={{
                    fontWeight: "800",
                    fontSize: "48px",
                  }}
                >{capitalizeFirstLetter(animal.condition)}</span>
              </Stack>
            </Stack>
            <Stack>
              <p 
                style={{
                  fontSize: "20px",
                  lineHeight: "36px",
                  fontWeight: "600",
                }}>
              {capitalizeFirstLetter(animal.animal_type)} - czy wiesz, że?
              </p>
              <span>{funFact}</span>
            </Stack>
          </Box>
        </Stack>
      </Box>

    </StyledModal >
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

  const [popupOpen, setPopupOpen] = React.useState(false);

  const handleClick = () => {
    setPopupOpen(true);
  };

  const handleClose = () => {
    setPopupOpen(false);
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
    const allowedAnimals = filterContext.filters['animals'];

    setMarkers(data.map((marker, index) => {
      const key = `marker-${index}`;

      if (allowedAnimals && allowedAnimals.length != 0 && !allowedAnimals.includes(marker.animal_type)) {
        return null;
      }

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
  }, [data, zoom, filterContext.filters['animals']]);


  return (
    <div style={{
      height: '100vh',
      width: '100vw',
    }}>
      <AnimalPopover
        open={popupOpen}
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
  const theme = createTheme({
    typography: {
      fontFamily: [
        "Inter",
        "Roboto",
      ].join(','),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Drawer>
        <GoogleMapComponent />
      </Drawer>
    </ThemeProvider>
  )
}

export default App


const StyledModal = styled(Modal)`
  position: fixed;
  z-index: 1300;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const style = (theme) => ({
  width: "60%",
  borderRadius: '0',
  padding: '0',
  backgroundColor: theme.palette.mode === 'dark' ? '#0A1929' : 'white',
  boxShadow: `0px 2px 24px ${theme.palette.mode === 'dark' ? '#000' : '#383838'}`,
});

const Backdrop = React.forwardRef((props, ref) => {
  const { open, className, ...other } = props;
  return (
    <div
      className={clsx({ 'MuiBackdrop-open': open }, className)}
      ref={ref}
      {...other}
    />
  );
});

Backdrop.propTypes = {
  className: PropTypes.string.isRequired,
  open: PropTypes.bool,
};

const StyledBackdrop = styled(Backdrop)`
  z-index: -1;
  position: fixed;
  inset: 0;
  background-color: rgb(0 0 0 / 0.5);
  -webkit-tap-highlight-color: transparent;
`;