import { isText } from "./elements/Text";
import { ElementBoxPosition } from "./consts";
import { Element } from "./types";

export const getCursorForElementBoxPosition = (
  position: ElementBoxPosition
) => {
  switch (position) {
    case ElementBoxPosition.InnerBox:
      return "grab";
    case ElementBoxPosition.TopLeft:
    case ElementBoxPosition.BottomRight:
      return "nwse-resize";
    case ElementBoxPosition.TopRight:
    case ElementBoxPosition.BottomLeft:
      return "nesw-resize";
    case ElementBoxPosition.Left:
    case ElementBoxPosition.Right:
      return "ew-resize";
    case ElementBoxPosition.Top:
    case ElementBoxPosition.Bottom:
      return "ns-resize";
    default:
      return "";
  }
};

export const setDocumentCursor = (cursor?: string) => {
  if (document.body.style.cursor !== cursor) {
    document.body.style.cursor = cursor ?? "";
  }
};

export const getRenderingHash = (
  elements: Element[],
  zoom: number,
  x: number,
  y: number
) => {
  let str = String(zoom + x + y);

  for (let i = 0; i < elements.length; i++) {
    str += getRenderingHashForElement(elements[i]);
  }

  return str;
};

export const getRenderingHashForElement = (element: Element) => {
  if (isText(element)) {
    return [
      element.x,
      element.y,
      element.scaleX,
      element.scaleY,
      element.localBox.x1,
      element.localBox.y1,
      element.localBox.x2,
      element.localBox.y2,
    ].join("");
  }

  return "";
};
