import { FC } from "react";
import { useStore } from "@nanostores/react";

import { $activeElement, $renderingKey, scheduleUpdate } from "../Core/state";
import { isText } from "../Core/elements/Text";
import { TextDetails } from "./TextDetails";

import "./ElementDetails.css";

export const ElementDetails: FC = () => {
  useStore($renderingKey);

  const activeElement = useStore($activeElement);

  const handleColorSelect = (newColor: string) => {
    if (isText(activeElement)) {
      scheduleUpdate(() => {
        activeElement.setColor(newColor);
      });
    }
  };

  return (
    <div className="details-panel">
      {activeElement && isText(activeElement) && (
        <TextDetails text={activeElement} onColorChange={handleColorSelect} />
      )}
    </div>
  );
};
