import { ElementBoxPosition } from "./consts";
import { Box, Element, Position } from "./types";

export const getVectorByPosition = (position: ElementBoxPosition) => {
  switch (position) {
    case ElementBoxPosition.TopLeft:
      return [-1, -1];
    case ElementBoxPosition.BottomRight:
      return [1, 1];
    case ElementBoxPosition.TopRight:
      return [1, -1];
    case ElementBoxPosition.BottomLeft:
      return [-1, 1];
    case ElementBoxPosition.Left:
      return [-1, 0];
    case ElementBoxPosition.Right:
      return [1, 0];
    case ElementBoxPosition.Top:
      return [0, -1];
    case ElementBoxPosition.Bottom:
      return [0, 1];
    case ElementBoxPosition.InnerBox:
    default:
      return [0, 0];
  }
};

// TODO: Rename
export const calculateResizedElementPosition = (
  element: Element,
  direction: ElementBoxPosition,
  mouseCurrX: number,
  mouseCurrY: number,
  mouseStartX: number,
  mouseStartY: number
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
export const getInnerBox = (
  x: number,
  y: number,
  localBox: Box,
  scaleX: number,
  scaleY: number
) => {
  return {
    x1: x + localBox.x1 * scaleX,
    y1: y + localBox.y1 * scaleY,
    x2: x + localBox.x2 * scaleX,
    y2: y + localBox.y2 * scaleY,
  };
};

export const expandBox = (box: Box, offset: number) => {
  return {
    x1: box.x1 - offset,
    y1: box.y1 - offset,
    x2: box.x2 + offset,
    y2: box.y2 + offset,
  };
};

export const transformBox = (
  box: Box,
  transformPositionFn: (x: number, y: number) => Position
) => {
  const transformed1 = transformPositionFn(box.x1, box.y1);
  const transformed2 = transformPositionFn(box.x2, box.y2);
  return {
    x1: transformed1[0],
    y1: transformed1[1],
    x2: transformed2[0],
    y2: transformed2[1],
  };
};

export const isPointInBox = (x: number, y: number, box: Box) => {
  return x > box.x1 && y > box.y1 && x < box.x2 && y < box.y2;
};

// TODO: I should return a vector here
export const getElementBoxPosition = (
  x: number,
  y: number,
  innerBox: Box
): ElementBoxPosition => {
  if (
    x > innerBox.x1 &&
    x < innerBox.x2 &&
    y > innerBox.y1 &&
    y < innerBox.y2
  ) {
    return ElementBoxPosition.InnerBox;
  }

  if (x <= innerBox.x1 && y <= innerBox.y1) {
    return ElementBoxPosition.TopLeft;
  }

  if (x >= innerBox.x2 && y <= innerBox.y1) {
    return ElementBoxPosition.TopRight;
  }

  if (x <= innerBox.x1 && y >= innerBox.y2) {
    return ElementBoxPosition.BottomLeft;
  }

  if (x >= innerBox.x2 && y >= innerBox.y2) {
    return ElementBoxPosition.BottomRight;
  }

  if (x <= innerBox.x1) {
    return ElementBoxPosition.Left;
  }

  if (x >= innerBox.x2) {
    return ElementBoxPosition.Right;
  }

  if (y <= innerBox.y1) {
    return ElementBoxPosition.Top;
  }

  if (y >= innerBox.y2) {
    return ElementBoxPosition.Bottom;
  }

  throw new Error("Cannot define element position")
};

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

export const setDocumentCursor = (cursor: string) => {
  if (document.body.style.cursor !== cursor) {
    document.body.style.cursor = cursor ?? "";
  }
};
