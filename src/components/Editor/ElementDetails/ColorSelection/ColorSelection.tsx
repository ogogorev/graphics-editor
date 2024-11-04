import { FC } from "react";

import "./ColorSelection.css";

type ColorSelection = {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
};

export const ColorSelection: FC<ColorSelection> = ({
  colors,
  selectedColor,
  onColorSelect,
}) => {
  return (
    <div>
      {colors.map((color) => (
        <button
          key={color}
          className="color-button"
          style={{
            backgroundColor: color,
            boxShadow: color === selectedColor ? `0 0 0 4px ${color}` : "none",
          }}
          onClick={() => onColorSelect(color)}
          type="button"
        ></button>
      ))}
    </div>
  );
};
