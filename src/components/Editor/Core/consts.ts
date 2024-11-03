export const OUTER_BOX_OFFSET = 10;

export const SELECTION_BOX_CONTROL_POINT_SIZE = 10;
export const SELECTION_BOX_OFFSET = SELECTION_BOX_CONTROL_POINT_SIZE / 2;

export const SELECTION_COLOR = "#34b4eb";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 8;
export const ZOOM_SENSITIVITY = 100;

export enum ElementBoxPosition {
  InnerBox = "InnerBox",
  TopLeft = "TopLeft",
  TopRight = "TopRight",
  BottomLeft = "BottomLeft",
  BottomRight = "BottomRight",
  Top = "Top",
  Bottom = "Bottom",
  Left = "Left",
  Right = "Right",
}
