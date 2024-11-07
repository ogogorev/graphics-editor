import {
  calculateNewViewport as calculateNewViewportMath,
  calculatePinchZoom as calculatePinchZoomMath,
} from "./math";
import { Point, RenderingState } from "./types";

export const renderingState: RenderingState = {
  // After resize is implemented, the width and height should be set from outside
  w: window.innerWidth,
  h: window.innerHeight,

  touch1X: 0,
  touch1Y: 0,
  touch2X: 0,
  touch2Y: 0,

  physicalTouch1X: 0,
  physicalTouch1Y: 0,
  physicalTouch2X: 0,
  physicalTouch2Y: 0,

  zoom: 1,

  viewportOffsetX: 0,
  viewportOffsetY: 0,
};

export const setW = (w: number) => {
  renderingState.w = w;
};

export const setH = (h: number) => {
  renderingState.h = h;
};

export const setTouchPoints = (
  x1?: number,
  y1?: number,
  x2?: number,
  y2?: number
) => {
  console.log("set touch pos", x1, y1, x2, y2);

  if (x1 == null || y1 == null) {
    renderingState.physicalTouch1X = -1;
    renderingState.physicalTouch1Y = -1;
    renderingState.touch1X = -1;
    renderingState.touch1Y = -1;
  } else {
    renderingState.physicalTouch1X = x1;
    renderingState.physicalTouch1Y = y1;

    const canvasPosition1 = getLogicalPosition([x1, y1]);
    renderingState.touch1X = canvasPosition1[0];
    renderingState.touch1Y = canvasPosition1[1];
  }

  if (x2 == null || y2 == null) {
    renderingState.physicalTouch2X = -1;
    renderingState.physicalTouch2Y = -1;
    renderingState.touch2X = -1;
    renderingState.touch2Y = -1;
  } else {
    renderingState.physicalTouch2X = x2;
    renderingState.physicalTouch2Y = y2;

    const canvasPosition2 = getLogicalPosition([x2, y2]);
    renderingState.touch2X = canvasPosition2[0];
    renderingState.touch2Y = canvasPosition2[1];
  }
};

export const getPhysicalX = (x: number) =>
  ((x - renderingState.viewportOffsetX) * renderingState.w) /
  (renderingState.w / renderingState.zoom);

export const getPhysicalY = (y: number) =>
  ((y - renderingState.viewportOffsetY) * renderingState.h) /
  (renderingState.h / renderingState.zoom);

export const getPhysicalPosition = (point: Point): Point => [
  getPhysicalX(point[0]),
  getPhysicalY(point[1]),
];

export const getLogicalPosition = (point: Point): Point => {
  return [
    renderingState.viewportOffsetX + point[0] / renderingState.zoom,
    renderingState.viewportOffsetY + point[1] / renderingState.zoom,
  ];
};

export const calculateNewViewport = (
  newZoom?: number,
  dx?: number,
  dy?: number,
  newFocusX?: number,
  newFocusY?: number
) => {
  return calculateNewViewportMath(
    renderingState.w,
    renderingState.h,
    renderingState.zoom,
    renderingState.viewportOffsetX,
    renderingState.viewportOffsetY,
    newZoom,
    dx,
    dy,
    newFocusX,
    newFocusY
  );
};

export const setViewport = (
  zoom: number,
  newOffsetX: number,
  newOffsetY: number
) => {
  renderingState.zoom = zoom;
  renderingState.viewportOffsetX = newOffsetX;
  renderingState.viewportOffsetY = newOffsetY;
};

export const updateViewport = (
  ...args: Parameters<typeof calculateNewViewport>
) => {
  const newViewport = calculateNewViewport(...args);
  setViewport(newViewport[0], newViewport[1], newViewport[2]);
};

export const calculatePinchZoom = (
  startTouchPoints: Point[],
  currentTouchPoints: Point[]
) => {
  const [newZoom, newFocusX, newFocusY] = calculatePinchZoomMath(
    renderingState.zoom,
    startTouchPoints,
    currentTouchPoints
  );

  const [zoom, frameOffsetX, frameOffsetY] = calculateNewViewport(
    newZoom,
    undefined,
    undefined,
    newFocusX,
    newFocusY
  );

  return [zoom, frameOffsetX, frameOffsetY];
};
