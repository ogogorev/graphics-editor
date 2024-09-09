export type Position = [number, number];

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
