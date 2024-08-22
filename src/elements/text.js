import { OUTER_BOX_OFFSET } from "../consts.js";
import { FONTS, loadedFonts } from "../fonts.js";
import { getInnerBox, getOuterBox } from "../geometry.js";

export class Text {
  type = "text";

  label;
  path;
  font;
  fontSize = 72;

  x;
  y;
  scaleX = 1;
  scaleY = 1;

  localBox;

  constructor(label, x, y) {
    this.label = "Text";
    this.x = x;
    this.y = y;

    this.font = loadedFonts[FONTS.SankofaDisplay.id];

    this.update();
  }

  setLabel = (newLabel) => {
    this.label = newLabel;

    this.update();
  };

  setProps = (x, y, scaleX, scaleY) => {
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

  get outerBox() {
    return getOuterBox(
      this.x,
      this.y,
      this.localBox,
      this.scaleX,
      this.scaleY,
      OUTER_BOX_OFFSET
    );
  }
}
