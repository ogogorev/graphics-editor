import { ELEMENT_BOX_POSITION } from "./consts.js";

export const getVectorByPosition = (position) => {
  switch (position) {
    case ELEMENT_BOX_POSITION.TopLeft:
      return [-1, -1];
    case ELEMENT_BOX_POSITION.BottomRight:
      return [1, 1];
    case ELEMENT_BOX_POSITION.TopRight:
      return [1, -1];
    case ELEMENT_BOX_POSITION.BottomLeft:
      return [-1, 1];
    case ELEMENT_BOX_POSITION.Left:
      return [-1, 0];
    case ELEMENT_BOX_POSITION.Right:
      return [1, 0];
    case ELEMENT_BOX_POSITION.Top:
      return [0, -1];
    case ELEMENT_BOX_POSITION.Bottom:
      return [0, 1];
    case ELEMENT_BOX_POSITION.InnerBox:
    default:
      return [0, 0];
  }
};

// TODO: Rename
export const calculateResizedElementPosition = (
  element,
  direction,
  mouseCurrX,
  mouseCurrY,
  mouseStartX,
  mouseStartY
) => {
  const [kX, kY] = getVectorByPosition(direction);

  const distX = (mouseCurrX - mouseStartX) * kX;
  const distY = (mouseCurrY - mouseStartY) * kY;

  const currW = element.w;
  const currH = element.h;

  const newW = currW + distX;
  const newH = currH + distY;

  const scaleX = newW / currW;
  const scaleY = newH / currH;

  const box = element.innerBox;

  let x = element.x;
  let y = element.y;

  const scaleDX = scaleX - 1;
  const innerX = box.x1 - x;

  if (kX > 0) x = x - innerX * scaleDX;
  if (kX < 0) x = x - innerX * scaleDX - currW * scaleDX;

  const scaleDY = scaleY - 1;
  const innerY = box.y1 - y;

  if (kY > 0) y = y - innerY * scaleDY;
  if (kY < 0) y = y - innerY * scaleDY - currH * scaleDY;

  return [x, y, element.scaleX * scaleX, element.scaleY * scaleY];
};

// TODO: Should be renamed. Should be clear that it translates and scales
export const getInnerBox = (x, y, localBox, scaleX, scaleY) => {
  return {
    x1: x + localBox.x1 * scaleX,
    y1: y + localBox.y1 * scaleY,
    x2: x + localBox.x2 * scaleX,
    y2: y + localBox.y2 * scaleY,
  };
};

export const expandBox = (box, offset) => {
  return {
    x1: box.x1 - offset,
    y1: box.y1 - offset,
    x2: box.x2 + offset,
    y2: box.y2 + offset,
  };
};

export const transformBox = (box, transformPositionFn) => {
  const transformed1 = transformPositionFn(box.x1, box.y1);
  const transformed2 = transformPositionFn(box.x2, box.y2);
  return {
    x1: transformed1[0],
    y1: transformed1[1],
    x2: transformed2[0],
    y2: transformed2[1],
  };
};

export const isPointInBox = (x, y, box) => {
  return x > box.x1 && y > box.y1 && x < box.x2 && y < box.y2;
};

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
  if (document.body.style.cursor !== cursor) {
    document.body.style.cursor = cursor ?? "";
  }
};
