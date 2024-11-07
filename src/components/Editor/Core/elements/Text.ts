import { loadedFonts } from "../fonts/fonts";
import { FontId, OpentypeFont } from "../fonts/types";
import { Element, ElementType, OpentypePath } from "../types";
import { getTranslatedInnerBox } from "../math";

export class Text implements Element {
  type = ElementType.Text;

  label: string;
  path: OpentypePath;
  font: OpentypeFont;
  fontSize = 72;
  color: string;

  x;
  y;
  scaleX = 1;
  scaleY = 1;

  localBox;

  constructor(label = "Text", color = "black", x = 400, y = 100) {
    this.label = label;
    this.color = color;
    this.x = x;
    this.y = y;

    this.font = loadedFonts[FontId.Roboto];

    this.path = this.getPath();
    this.updateColorOnPath();

    this.localBox = this.path.getBoundingBox();
  }

  setLabel = (newLabel: string) => {
    this.label = newLabel;

    this.update();
  };

  getPath = () => {
    return this.font.getPath(this.label, 0, this.fontSize, this.fontSize);
  };

  setProps = (x: number, y: number, scaleX?: number, scaleY?: number) => {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (scaleX != null) this.scaleX = scaleX;
    if (scaleY != null) this.scaleY = scaleY;

    this.updateBox();
  };

  update = () => {
    this.updatePath();
    this.updateBox();
  };

  updatePath = () => {
    this.path = this.getPath();
    this.updateColorOnPath();
  };

  updateBox = () => {
    this.localBox = this.path.getBoundingBox();
  };

  // A workaround to set color on text. Not an ideal solution.
  updateColorOnPath = () => {
    this.path.fill = this.color;
  };

  setColor = (newColor: string) => {
    this.color = newColor;
    this.updateColorOnPath();
  };

  get w() {
    return (this.localBox.x2 - this.localBox.x1) * this.scaleX;
  }

  get h() {
    return (this.localBox.y2 - this.localBox.y1) * this.scaleY;
  }

  get innerBox() {
    return getTranslatedInnerBox(
      this.x,
      this.y,
      this.localBox,
      this.scaleX,
      this.scaleY
    );
  }
}

export const isText = (element: Element): element is Text => {
  return element.type === ElementType.Text;
};
