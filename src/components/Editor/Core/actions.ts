import { ElementBoxPosition } from "./consts";
import {
  DraggingAction,
  EditorAction,
  EditorActionType,
  MovingCanvasAction,
  ZoomingAction,
  Position,
  ResizingAction,
  SelectedElementAction,
} from "./types";

// TODO: Move away from array to objects?

export const createDraggingAction = (
  startX: number,
  startY: number
): DraggingAction => {
  return [EditorActionType.Dragging, { startX, startY }];
};

export const createSelectedElementAction = (): SelectedElementAction => {
  return [EditorActionType.SelectedElement];
};

export const createResizingAction = (
  startX: number,
  startY: number,
  direction: ElementBoxPosition
): ResizingAction => {
  return [EditorActionType.Resizing, { startX, startY, direction }];
};

export const createMovingCanvasAction = (
  startX: number,
  startY: number
): MovingCanvasAction => {
  return [EditorActionType.MovingCanvas, { startX, startY }];
};

export const createZoomingAction = (
  touchPoints: Position[]
): ZoomingAction => {
  return [EditorActionType.Zooming, touchPoints];
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

export const isZoomingAction = (
  action: EditorAction | []
): action is ZoomingAction => {
  return action[0] === EditorActionType.Zooming;
};


export const isActionSet = (
  action: EditorAction | []
): action is EditorAction => {
  return Boolean(action[0]);
};
