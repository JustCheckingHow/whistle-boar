import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { useDebouncedCallback } from 'use-debounce';

function getSuggestions(value, callback) {
  const inputValue = value.trim().toLowerCase();
  fetch(`${import.meta.env.VITE_ROOT_API}/autocomplete?place=${inputValue}`)
    .then(response => response.json())
    .then(data => {
      callback(data.predictions)
    });
};

const GoogleMaps = ({ callback }) => {
  const [options, setOptions] = React.useState([]);

  const debounced = useDebouncedCallback((value) => {
    getSuggestions(value, (data) => {
      console.log(data);
      setOptions(data);
    });
  }, 500);

  return <Autocomplete
    renderInput={(params) => <TextField {...params} label="Lokalizacja" />}
    options={options}
    onInputChange={(event, value) => {
      debounced(value);
    }}
    getOptionLabel={(option) => option.description}
    onChange={(event, value) => {
      if (value) {
        fetch(`${import.meta.env.VITE_ROOT_API}/place_details?place_id=${value.place_id}`)
          .then(response => response.json())
          .then(data => {
            const { lat, lng } = data.result.geometry.location;
            callback({ lat, lng, location: value.description });
          });
      }
    }}
  />
}

export default GoogleMaps;