import React, { useState } from 'react';
import stc from "string-to-color";

export const Marker = (props) => {
  const [hovered, setHovered] = useState(false);
  const color = stc(props.type);

  const RADIUS_MAP = {
    15: 50,
    14: 40,
    13: 30,
    12: 20,
    11: 10,
    10: 5,
  };

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
    onClick={props.onClick}
  >
  </div>;
};
