import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { Button, MenuItem, Select, TextField } from '@mui/material';
import { StyledModal, StyledBackdrop } from "./App";

import Slider from '@mui/material/Slider';

import { FilterContext } from './filterContext';
import { useFormik } from 'formik';
import { usePlacesWidget } from "react-google-autocomplete";
import GoogleMapsComponent from './GoogleMaps';

const drawerWidth = 300;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft(props) {
  const [filters, setFilters] = React.useState({});
  const [uniqueAnimals, setUniqueAnimals] = React.useState([]);
  const [currentAnimal, setCurrentAnimal] = React.useState("");

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        uniqueAnimals,
        setUniqueAnimals,
        currentAnimal,
        setCurrentAnimal,
      }}
    >
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: "#ffffff", color: "#000000" }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ mr: 2 }}
            >
              <img src="logo.jpg" style={{ width: "50px", height: "50px" }} />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Whistleboar
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: "#eaeaea",
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <DrawerHeader>
          </DrawerHeader>
          <Divider />
          <Filters />
        </Drawer>
        <Main open={true}>
          <DrawerHeader />
          {props.children}
        </Main>
      </Box>
      <TimeSlider />
    </FilterContext.Provider>
  );
}

const Filters = () => {
  const filters = React.useContext(FilterContext);
  const [popupOpen, setPopupOpen] = React.useState(false);

  const options = filters.uniqueAnimals;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      height: "100%",
    }}>
      <span>
        Masz zgłoszenie? Zadzwoń na numer +48 732 070 941
      </span>
      <Autocomplete
        id="filter-animals"
        options={options}
        sx={{ margin: "16pt" }}
        renderInput={(params) => <TextField {...params} label="Zwierzęta" sx={{ backgroundColor: "white" }} />}
        multiple
        onChange={(event, value) => {
          filters.setFilters({
            ...filters.filters,
            animals: value,
          });
        }}
      />
      <Button
        variant="contained"
        sx={{ margin: "16pt" }}
        onClick={() => {
          setPopupOpen(true);
        }}>Dodaj zwierzę
      </Button>
      <AddAnimalForm
        open={popupOpen}
        handleClose={() => {
          setPopupOpen(false);
        }}
      />
    </div>
  );
}

const TimeSlider = () => {
  const filters = React.useContext(FilterContext);
  // max distance: 1 day in seconds
  const maxDistance = 24 * 60 * 60;
  // min distance: 1 hour in seconds
  const minDistance = 60 * 60;

  // min: current epoch rounded up to hour minus 7 days
  const roundedUp = Math.ceil(new Date().getTime() / 1000);
  const epochMin = roundedUp - (roundedUp % (60 * 60)) - 7 * 24 * 60 * 60;

  // max: current epoch rounded up to hour
  const epochMax = roundedUp - (roundedUp % (60 * 60));

  // current: current epoch - max distance
  const defaultEpoch = epochMax - maxDistance;

  const [value, setValue] = React.useState([defaultEpoch, epochMax]);

  const handleChange = (event, newValue, activeThumb) => {
    // if active thumb is left one, check if distance is not too big
    // if it is, set right thumb to shift left thumb by difference
    if (activeThumb === 0) {
      if (newValue[1] - newValue[0] > maxDistance) {
        setValue([newValue[0], newValue[0] + maxDistance]);
      } else if (newValue[1] - newValue[0] < minDistance) {
        setValue([newValue[0], newValue[0] + minDistance]);
      } else {
        setValue(newValue);
      }
    }

    // for the right thumb, do analogical thing
    if (activeThumb === 1) {
      if (newValue[1] - newValue[0] > maxDistance) {
        setValue([newValue[1] - maxDistance, newValue[1]]);
      } else if (newValue[1] - newValue[0] < minDistance) {
        setValue([newValue[1] - minDistance, newValue[1]]);
      } else {
        setValue(newValue);
      }
    }
  };

  React.useEffect(() => {
    filters.setFilters({
      ...filters.filters,
      time: {
        min: new Date(value[0] * 1000),
        max: new Date(value[1] * 1000),
      },
    });
  }, [value]);

  const timestampToDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${date.getHours() + 1}:00`;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: "5%",
        right: "5%",
        width: '45%',
        backgroundColor: 'white',
        zIndex: 1000,
        boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.75)',
        padding: "0 16pt",
      }}
    >
      <h2>Oś czasu</h2>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={epochMin}
        max={epochMax}
        getAriaValueText={timestampToDate}
        valueLabelFormat={timestampToDate}
        step={60 * 60}
      />
    </div>
  );
}

function AddAnimalForm(props) {
  const { open, handleClose } = props;
  const formik = useFormik({
    initialValues: {
      animal_type: '',
      image: '',
      behaviour: '',
      condition: 'zdrowe',
      location: '',
      location_lon: '',
      location_lat: '',
    },
    onSubmit: (values) => {
      const formData = new FormData();
      formData.append('animal_type', values.animal_type);
      formData.append('image', values.image);
      formData.append('behaviour', values.behaviour);
      formData.append('condition', values.condition);
      formData.append('location', values.location);
      formData.append('location_lon', values.location_lon);
      formData.append('location_lat', values.location_lat);

      fetch(`${import.meta.env.VITE_ROOT_API}/submit`, {
        method: 'POST',
        body: formData,
      }).then(() => {
        handleClose();
      });
    }
  })

  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetch(`${import.meta.env.VITE_ROOT_API}/reverse_geocode?lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data)
            formik.setFieldValue('location', data.display_name);
          });
      })
    }
  }, []);

  return (
    <StyledModal
      aria-labelledby="unstyled-modal-title"
      aria-describedby="unstyled-modal-behaviour"
      open={open}
      onClose={handleClose}
      slots={{ backdrop: StyledBackdrop }}
    >
      <Box sx={style}>
        <Typography id="unstyled-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Dodaj zwierzę
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="animal_type"
            name="animal_type"
            label="Gatunek"
            value={formik.values.animal_type}
            onChange={formik.handleChange}
            sx={{ mb: 2 }}
          />
          <Select
            fullWidth
            id="condition"
            name="condition"
            label="Stan"
            value={formik.values.condition}
            onChange={formik.handleChange}
            sx={{ mb: 2 }}
            defaultValue="zdrowe"
          >
            <MenuItem value="zdrowe">Zdrowe</MenuItem>
            <MenuItem value="ranne">Ranne</MenuItem>
            <MenuItem value="martwe">Martwe</MenuItem>
          </Select>
          <GoogleMapsComponent 
            callback={({lng, lat, location}) => {
              formik.setFieldValue('location_lon', lng);
              formik.setFieldValue('location_lat', lat);
              formik.setFieldValue('location', location);
            }}
          />
          <TextField
            fullWidth
            id="behaviour"
            name="behaviour"
            label="Zachowanie"
            value={formik.values.behaviour}
            onChange={formik.handleChange}
            sx={{ mb: 2, mt: 2 }}
          />
          <Button type="submit" variant="contained" sx={{ float: 'right' }}>Dodaj</Button>
        </form>
      </Box>

    </StyledModal >
  );
}

const style = (theme) => ({
  width: "25%",
  borderRadius: '0',
  padding: '16pt 32pt',
  backgroundColor: theme.palette.mode === 'dark' ? '#0A1929' : 'white',
  boxShadow: `0px 2px 24px ${theme.palette.mode === 'dark' ? '#000' : '#383838'}`,
});