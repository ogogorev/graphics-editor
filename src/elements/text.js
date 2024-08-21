import { OUTER_BOX_OFFSET } from "../consts.js";
import { FONTS, loadedFonts } from "../fonts.js";

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
  innerBox;
  outerBox;

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

  update = () => {
    this.updatePath();
    this.updateBox();
  };

  updatePath = () => {
    this.path = this.font.getPath(this.label, 0, this.fontSize, this.fontSize);

    // const fontSize = 72;
    // const fontScale = (1 / this.font.unitsPerEm) * fontSize;

    // const topY = -(this.font.ascender * fontScale);
    // const bottomY = -(this.font.descender * fontScale);

    // console.log("text path", this.path, {
    //   asc: this.font.ascender,
    //   desc: this.font.descender,
    //   u: this.font.unitsPerEm,
    //   fontScale,
    //   topY,
    //   bottomY,
    // });
  };

  updateBox = () => {
    const box = this.path.getBoundingBox();
    const { x1, y1, x2, y2 } = box;

    console.log("update box", { box, p: this.path });

    this.innerBox = {
      x1: x1 + this.x,
      y1: y1 + this.y,
      x2: x2 + this.x,
      y2: y2 + this.y,
    };

    this.outerBox = {
      x1: this.innerBox.x1 - OUTER_BOX_OFFSET,
      y1: this.innerBox.y1 - OUTER_BOX_OFFSET,
      x2: this.innerBox.x2 + OUTER_BOX_OFFSET,
      y2: this.innerBox.y2 + OUTER_BOX_OFFSET,
    };
  };
}
