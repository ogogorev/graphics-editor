import {
  ElementBoxPosition,
  MAX_ZOOM,
  MIN_ZOOM,
  ZOOM_SENSITIVITY,
} from "./consts";
import { Box, Element, Point } from "./types";

export const calculateNewViewport = (
  canvasW: number,
  canvasH: number,
  currZoom: number,
  currViewportOffsetX: number,
  currViewportOffsetY: number,
  newZoom?: number,
  dx?: number,
  dy?: number,
  newFocusX?: number,
  newFocusY?: number
) => {
  // Deliberately assuming that zoom is not provided in such a case
  if (dx != null && dy != null) {
    if (newZoom != null) {
      throw Error("zoom value should not be passed with dx/dy values!");
    }
    return [currZoom, currViewportOffsetX - dx, currViewportOffsetY - dy];
  }

  newFocusX = newFocusX ?? canvasW / 2;
  newFocusY = newFocusY ?? canvasH / 2;

  const ratioX = newFocusX / canvasW;
  const ratioY = newFocusY / canvasH;

  const currW = canvasW / currZoom;
  const currH = canvasH / currZoom;

  const zoomedFocusX = currViewportOffsetX + ratioX * currW;
  const zoomedFocusY = currViewportOffsetY + ratioY * currH;

  newZoom = newZoom ?? currZoom;
  newZoom = Math.max(Math.min(newZoom, MAX_ZOOM), MIN_ZOOM);

  const newW = canvasW / newZoom;
  const newH = canvasH / newZoom;

  const newOffsetX = zoomedFocusX - ratioX * newW;
  const newOffsetY = zoomedFocusY - ratioY * newH;

  // console.log("getViewport", { zoom, focusX, newW, newOffsetX });

  return [newZoom, newOffsetX, newOffsetY];
};

export const calculatePinchZoom = (
  currZoom: number,
  startTouchPoints: Point[],
  currentTouchPoints: Point[]
) => {
  console.log("calculatePinchZoom", { startTouchPoints, currentTouchPoints });

  const [startPoint1, startPoint2] = startTouchPoints;
  const [currentPoint1, currentPoint2] = currentTouchPoints;

  const initialDist = Math.hypot(
    startPoint1[0] - startPoint2[0],
    startPoint1[1] - startPoint2[1]
  );
  const currDist = Math.hypot(
    currentPoint1[0] - currentPoint2[0],
    currentPoint1[1] - currentPoint2[1]
  );
  const dist = currDist - initialDist;

  const newZoom = currZoom * Math.pow(2, dist / ZOOM_SENSITIVITY);

  const newFocusX = (startPoint1[0] + startPoint2[0]) / 2;
  const newFocusY = (startPoint1[1] + startPoint2[1]) / 2;

  console.log("calc Zoom", { oldZoom: currZoom, newZoom, dist });

  return [newZoom, newFocusX, newFocusY];
};

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
  position: ElementBoxPosition,
  mouseCurrX: number,
  mouseCurrY: number,
  mouseStartX: number,
  mouseStartY: number
): [number, number, number, number] => {
  const [kX, kY] = getVectorByPosition(position);

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

export const getTranslatedInnerBox = (
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

export const enlargeBoxByOffset = (box: Box, offset: number) => {
  return {
    x1: box.x1 - offset,
    y1: box.y1 - offset,
    x2: box.x2 + offset,
    y2: box.y2 + offset,
  };
};

export const transformBox = (
  box: Box,
  transformPointFn: (point: Point) => Point
) => {
  const transformed1 = transformPointFn([box.x1, box.y1]);
  const transformed2 = transformPointFn([box.x2, box.y2]);
  return {
    x1: transformed1[0],
    y1: transformed1[1],
    x2: transformed2[0],
    y2: transformed2[1],
  };
};

export const isPointInBox = (point: Point, box: Box) => {
  return (
    point[0] > box.x1 &&
    point[1] > box.y1 &&
    point[0] < box.x2 &&
    point[1] < box.y2
  );
};

// TODO: A vector should be returned here?
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

  throw new Error("Cannot define element position");
};
