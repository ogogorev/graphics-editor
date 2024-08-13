import {
  SELECTION_BOX_CONTROL_POINT_SIZE,
  SELECTION_BOX_OFFSET,
  SELECTION_COLOR,
} from "./consts.js";

const W = window.innerWidth;
const H = window.innerHeight;

export class Canvas {
  constructor(canvasId) {
    console.log({ w: window.innerWidth, k: window.innerHeight });

    this.cnv = document.getElementById(canvasId);

    console.log("init canvas", window.devicePixelRatio);

    const dpi = window.devicePixelRatio;

    this.cnv.style.width = W + "px";
    this.cnv.style.height = H + "px";

    this.cnv.width = W * dpi;
    this.cnv.height = H * dpi;

    this.ctx = this.cnv.getContext("2d");
  }

  addListeners = (handlers) => {
    this.cnv.addEventListener("mousedown", handlers.onMouseDown);
    this.cnv.addEventListener("mousemove", handlers.onMouseMove);
    this.cnv.addEventListener("mouseup", handlers.onMouseUp);

    this.cnv.addEventListener("click", handlers.onClick);
  };
  drawRect = (x, y, w, h, fillColor, strokeColor) => {
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(x, y, w, h);
    }

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.strokeRect(x, y, w, h);
    }
  };

  drawText = (font, label, x, y) => {
    font.draw(this.ctx, label, x, y);
  };

  drawSelectionBox = (x, y, w, h) => {
    // TODO: Use x, y, w, h directly
    const boxX = x;
    const boxY = y;
    const boxW = w;
    const boxH = h;

    this.drawRect(
      boxX + SELECTION_BOX_OFFSET,
      boxY + SELECTION_BOX_OFFSET,
      boxW - SELECTION_BOX_OFFSET * 2,
      boxH - SELECTION_BOX_OFFSET * 2,
      undefined,
      SELECTION_COLOR
    );

    this.drawRect(
      boxX,
      boxY,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      boxX + boxW - SELECTION_BOX_CONTROL_POINT_SIZE,
      boxY,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      boxX,
      boxY + boxH - SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      boxX + boxW - SELECTION_BOX_CONTROL_POINT_SIZE,
      boxY + boxH - SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );
  };

  drawElement = (element) => {
    if (element.type === "text") {
      this.drawText(element.font, element.label, element.x, element.y);
    }
  };

  drawActiveElement = (element, x, y) => {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.drawElement(element);
    this.ctx.restore();
  };

  prepareFrame = () => {
    this.ctx.reset();

    const dpi = window.devicePixelRatio;
    this.ctx.scale(dpi, dpi);
  };
}
