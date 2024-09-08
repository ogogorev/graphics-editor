import { FC } from "react";

import { Text } from "../Core/elements/Text";
import { ColorSelection } from "./ColorSelection/ColorSelection";

type TextDetailsProps = {
  text: Text;
  onColorChange: (newColor: string) => void;
};

const COLORS = ["red", "green", "blue"];

export const TextDetails: FC<TextDetailsProps> = ({ text, onColorChange }) => {
  const { color } = text;

  return (
    <div>
      <ColorSelection
        colors={COLORS}
        selectedColor={color}
        onColorSelect={onColorChange}
      />
    </div>
  );
};
