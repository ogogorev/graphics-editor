import { FC } from "react";
import { useStore } from "@nanostores/react";

import { $activeElement } from "../Core/state";
import { isText } from "../Core/elements/Text";
import { TextDetails } from "./TextDetails";

import "./ElementDetails.css";

type ElementDetailsProps = {
  onChange: () => void;
};

export const ElementDetails: FC<ElementDetailsProps> = ({ onChange }) => {
  const activeElement = useStore($activeElement);

  const handleColorSelect = (newColor: string) => {
    if (isText(activeElement)) {
      activeElement.setColor(newColor);
    }
    onChange();
  };

  return (
    <div className="details-panel">
      {activeElement && isText(activeElement) && (
        <TextDetails text={activeElement} onColorChange={handleColorSelect} />
      )}
    </div>
  );
};
