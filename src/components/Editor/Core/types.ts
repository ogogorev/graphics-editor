import { ElementBoxPosition } from "./consts";

export type RenderingState = {
  w: number;
  h: number;

  touch1X: number;
  touch1Y: number;
  touch2X: number;
  touch2Y: number;

  physicalTouch1X: number;
  physicalTouch1Y: number;
  physicalTouch2X: number;
  physicalTouch2Y: number;

  zoom: number;

  viewportOffsetX: number;
  viewportOffsetY: number;
};

export type Point = [number, number];

export enum EditorActionType {
  Dragging = "Dragging",
  SelectedElement = "Selected",
  Resizing = "Resizing",
  MovingCanvas = "MovingCanvas",
  Zooming = "Zooming",
}

export type DraggingAction = [
  EditorActionType.Dragging,
  { startX: number; startY: number }
];

export type ResizingAction = [
  EditorActionType.Resizing,
  { startX: number; startY: number; direction: ElementBoxPosition }
];

export type MovingCanvasAction = [
  EditorActionType.MovingCanvas,
  { startX: number; startY: number }
];


export type ZoomingAction = [
  EditorActionType.Zooming,
  Point[],
];

export type SelectedElementAction = [EditorActionType.SelectedElement];

export type EditorAction =
  | DraggingAction
  | ResizingAction
  | MovingCanvasAction
  | SelectedElementAction
  | ZoomingAction;

export type Box = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export enum ElementType {
  Text = "Text",
}

export type OpentypePath = {
  getBoundingBox: () => Box;
  fill: string;
  draw: (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  ) => void;
};

export type Element = {
  type: ElementType;

  x: number;
  y: number;
  scaleX: number;
  scaleY: number;

  w: number;
  h: number;
  localBox: Box;
  innerBox: Box;

  setProps: (x: number, y: number, scaleX?: number, scaleY?: number) => void;
};
