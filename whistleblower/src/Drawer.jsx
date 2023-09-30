import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import Slider from '@mui/material/Slider';

import { FilterContext } from './filterContext';

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
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
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
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <Filters />
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          {props.children}
        </Main>
      </Box>
      <TimeSlider />
      <StoryTimeBox />
    </FilterContext.Provider>
  );
}

const Filters = () => {
  const filters = React.useContext(FilterContext);

  console.log(filters);

  return (
    <div>
      <h1>Filters</h1>
    </div>
  );
}

const TimeSlider = () => {
  const filters = React.useContext(FilterContext);

  const [value, setValue] = React.useState([0, 24]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: "5%",
        width: '25%',
        backgroundColor: 'white',
        zIndex: 1000,
      }}
    >
      <h2>Time</h2>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={0}
        max={24}
      />
    </div>
  );
}

const StoryTimeBox = () => {
  const filters = React.useContext(FilterContext);

  return (
    <div
      style={{
        position: 'fixed',
        top: "10%",
        right: "5%",
        width: '25%',
        backgroundColor: 'white',
        zIndex: 1000,
      }}
    >
      {filters.currentAnimal}
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc. Sed euismod, nisl eget ultricies ultrices, nunc nisl ultrices nunc, quis ultricies nisl nisl sit amet nunc.
    </div>
  );
}