import { ElementBoxPosition } from "./consts";
import { OpentypeFont } from "./fonts/types";

export type Position = [number, number];

export enum EditorActionType {
  Dragging = "Dragging",
  SelectedElement = "Selected",
  Resizing = "Resizing",
  MovingCanvas = "MovingCanvas",
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

export type Element = {
  type: ElementType;

  label: string;
  path: Path;
  font: OpentypeFont;
  fontSize: number;

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
