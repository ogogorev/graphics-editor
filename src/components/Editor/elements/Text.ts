// @ts-expect-error missing declaration
import { FONTS, loadedFonts } from "../fonts";
import { Element, ElementType } from "../types";
import { getInnerBox } from "../utils";

export class Text implements Element {
  type = ElementType.Text;

  label;
  path;
  font;
  fontSize = 72;

  x;
  y;
  scaleX = 1;
  scaleY = 1;

  localBox;

  constructor(label: string, x: number, y: number) {
    this.label = label;
    this.x = x;
    this.y = y;

    this.font = loadedFonts[FONTS.SankofaDisplay.id];

    this.path = this.font.getPath(this.label, 0, this.fontSize, this.fontSize);
    this.localBox = this.path.getBoundingBox();
  }

  setLabel = (newLabel: string) => {
    this.label = newLabel;

    this.update();
  };

  setProps = (x: number, y: number, scaleX: number, scaleY: number) => {
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
    this.path = this.font.getPath(this.label, 0, this.fontSize, this.fontSize);
  };

  updateBox = () => {
    this.localBox = this.path.getBoundingBox();
  };

  get w() {
    return (this.localBox.x2 - this.localBox.x1) * this.scaleX;
  }

  get h() {
    return (this.localBox.y2 - this.localBox.y1) * this.scaleY;
  }

  get innerBox() {
    return getInnerBox(this.x, this.y, this.localBox, this.scaleX, this.scaleY);
  }
}

// TODO: Create own file for this
export const isText = (element: Element): element is Text => {
  return element.type === ElementType.Text;
};
