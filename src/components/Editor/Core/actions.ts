import { ElementBoxPosition } from "./consts";
import {
  DraggingAction,
  EditorAction,
  EditorActionType,
  MovingCanvasAction,
  ResizingAction,
  SelectedElementAction,
} from "./types";

// TODO: Move away from array to objects?

export const createDraggingAction = (x: number, y: number): DraggingAction => {
  return [EditorActionType.Dragging, { x, y }];
};

export const createSelectedElementAction = (): SelectedElementAction => {
  return [EditorActionType.SelectedElement];
};

export const createResizingAction = (
  x: number,
  y: number,
  direction: ElementBoxPosition
): ResizingAction => {
  return [EditorActionType.Resizing, { x, y, direction }];
};

export const createMovingCanvasAction = (
  x: number,
  y: number
): MovingCanvasAction => {
  return [EditorActionType.MovingCanvas, { startX: x, startY: y }];
};

export const isDraggingAction = (
  action: EditorAction | []
): action is DraggingAction => {
  return action[0] === EditorActionType.Dragging;
};

export const isSelectedElementAction = (
  action: EditorAction | []
): action is SelectedElementAction => {
  return action[0] === EditorActionType.SelectedElement;
};

export const isResizingAction = (
  action: EditorAction | []
): action is ResizingAction => {
  return action[0] === EditorActionType.Resizing;
};

export const isMovingCanvasAction = (
  action: EditorAction | []
): action is MovingCanvasAction => {
  return action[0] === EditorActionType.MovingCanvas;
};
