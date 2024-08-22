import { ELEMENT_BOX_POSITION } from "./consts.js";

// TODO: I should return a vector here
export const getElementBoxPosition = (x, y, innerBox) => {
  if (
    x > innerBox.x1 &&
    x < innerBox.x2 &&
    y > innerBox.y1 &&
    y < innerBox.y2
  ) {
    return ELEMENT_BOX_POSITION.InnerBox;
  }

  if (x <= innerBox.x1 && y <= innerBox.y1) {
    return ELEMENT_BOX_POSITION.TopLeft;
  }

  if (x >= innerBox.x2 && y <= innerBox.y1) {
    return ELEMENT_BOX_POSITION.TopRight;
  }

  if (x <= innerBox.x1 && y >= innerBox.y2) {
    return ELEMENT_BOX_POSITION.BottomLeft;
  }

  if (x >= innerBox.x2 && y >= innerBox.y2) {
    return ELEMENT_BOX_POSITION.BottomRight;
  }

  if (x <= innerBox.x1) {
    return ELEMENT_BOX_POSITION.Left;
  }

  if (x >= innerBox.x2) {
    return ELEMENT_BOX_POSITION.Right;
  }

  if (y <= innerBox.y1) {
    return ELEMENT_BOX_POSITION.Top;
  }

  if (y >= innerBox.y2) {
    return ELEMENT_BOX_POSITION.Bottom;
  }
};

export const getCursorForElementBoxPosition = (position) => {
  switch (position) {
    case ELEMENT_BOX_POSITION.InnerBox:
      return "grab";
    case ELEMENT_BOX_POSITION.TopLeft:
    case ELEMENT_BOX_POSITION.BottomRight:
      return "nwse-resize";
    case ELEMENT_BOX_POSITION.TopRight:
    case ELEMENT_BOX_POSITION.BottomLeft:
      return "nesw-resize";
    case ELEMENT_BOX_POSITION.Left:
    case ELEMENT_BOX_POSITION.Right:
      return "ew-resize";
    case ELEMENT_BOX_POSITION.Top:
    case ELEMENT_BOX_POSITION.Bottom:
      return "ns-resize";
    default:
      return "";
  }
};

export const setDocumentCursor = (cursor) => {
  document.body.style.cursor = cursor;
};
