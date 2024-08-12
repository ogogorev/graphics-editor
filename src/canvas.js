const W = window.innerWidth;
const H = window.innerHeight;

const SELECTION_BOX_OFFSET = 8;
const SELECTION_BOX_CONTROL_POINT_SIZE = 8;
const SELECTION_COLOR = "#34b4eb";

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
    const boxX = x - SELECTION_BOX_OFFSET;
    const boxY = y - SELECTION_BOX_OFFSET;
    const boxW = w + SELECTION_BOX_OFFSET * 2;
    const boxH = h + SELECTION_BOX_OFFSET * 2;

    this.drawRect(boxX, boxY, boxW, boxH, undefined, SELECTION_COLOR);

    this.drawRect(
      boxX - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      boxY - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      boxX + boxW - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      boxY - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      boxX - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      boxY + boxH - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      boxX + boxW - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
      boxY + boxH - SELECTION_BOX_CONTROL_POINT_SIZE / 2,
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
