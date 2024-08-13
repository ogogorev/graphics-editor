import { OUTER_BOX_OFFSET } from "../consts.js";
import { FONTS, loadedFonts } from "../fonts.js";

export class Text {
  type = "text";

  label;
  path;
  font;

  x;
  y;
  box;
  outerBox;

  constructor(label, x, y) {
    this.label = "Text";
    this.x = 100;
    this.y = 100;

    this.font = loadedFonts[FONTS.SankofaDisplay.id];

    this.path = this.font.getPath(label, x, y);

    this.updateBox();
  }

  setLabel = (newLabel) => {
    this.label = newLabel;
    this.updateBox();
  };

  updateBox = () => {
    this.path = this.font.getPath(this.label, this.x, this.y);
    this.box = this.path.getBoundingBox();

    this.outerBox = {
      x1: this.box.x1 - OUTER_BOX_OFFSET,
      y1: this.box.y1 - OUTER_BOX_OFFSET,
      x2: this.box.x2 + OUTER_BOX_OFFSET,
      y2: this.box.y2 + OUTER_BOX_OFFSET,
    };
  };
}
