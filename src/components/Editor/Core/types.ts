import { ElementBoxPosition } from "./consts";

export type Position = [number, number];

export enum EditorActionType {
  Dragging = "Dragging",
  SelectedElement = "Selected",
  Resizing = "Resizing",
  MovingCanvas = "MovingCanvas",
}

// TODO: Rename x, y to startX, startY
export type DraggingAction = [
  EditorActionType.Dragging,
  { x: number; y: number }
];
// TODO: Rename x, y to startX, startY
export type ResizingAction = [
  EditorActionType.Resizing,
  { x: number; y: number; direction: ElementBoxPosition }
];
export type MovingCanvasAction = [
  EditorActionType.MovingCanvas,
  { startX: number; startY: number }
];

export type SelectedElementAction = [EditorActionType.SelectedElement];

export type EditorAction =
  | DraggingAction
  | ResizingAction
  | MovingCanvasAction
  | SelectedElementAction;

export type Box = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export enum ElementType {
  Text = "Text",
}

export type Path = {
  getBoundingBox: () => Box;
};
export type Font = any;

export type Element = {
  type: ElementType;

  label: string;
  path: Path;
  font: Font;
  fontSize: number;

  x: number;
  y: number;
  scaleX: number;
  scaleY: number;

  w: number;
  h: number;
  localBox: Box;
  innerBox: Box;
};
