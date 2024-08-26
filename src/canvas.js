import {
  SELECTION_BOX_CONTROL_POINT_SIZE,
  SELECTION_BOX_OFFSET,
  SELECTION_COLOR,
} from "./consts.js";

const W = window.innerWidth;
const H = window.innerHeight;

// TODO: Move to consts
const RESIZE_DIRECTION = {
  TopLeft: "TopLeft",
  TopRight: "TopRight",
  BottomLeft: "BottomLeft",
  BottomRight: "BottomRight",
  Top: "Top",
  Bottom: "Bottom",
  Left: "Left",
  Right: "Right",
};

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

    this.cnv.addEventListener("wheel", handlers.onWheel);

    this.cnv.addEventListener("click", handlers.onClick);
  };

  get w() {
    return W;
  }

  get h() {
    return H;
  }

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

  drawTextWithFont = (font, label, x, y) => {
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

  drawElementContent = (element) => {
    if (element.type === "text") {
      this.drawTextWithFont(element.font, element.label, 0, element.fontSize);
    }
  };

  drawElement = (element, x, y, scaleX, scaleY) => {
    this.ctx.save();

    this.ctx.translate(x ?? element.x, y ?? element.y);
    this.ctx.scale(scaleX ?? element.scaleX, scaleY ?? element.scaleY);

    this.drawElementContent(element);

    this.ctx.restore();
  };

  drawDashedLine = (startX, startY, endX, endY) => {
    this.ctx.beginPath();
    this.ctx.strokeStyle = "green";
    this.ctx.setLineDash([5, 5]);
    this.ctx.lineWidth = 2;
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.lineWidth = 1;
  };

  prepareFrame = (zoom, x, y) => {
    this.ctx.reset();

    const dpi = window.devicePixelRatio;

    this.ctx.scale(dpi * zoom, dpi * zoom);
    this.ctx.translate(x, y);

    // const drawDashedLine = (startX, startY, endX, endY) => {
    //   this.ctx.beginPath();
    //   this.ctx.strokeStyle = "#dddddd80";
    //   // this.ctx.setLineDash([5, 5]);
    //   this.ctx.lineWidth = 1;
    //   this.ctx.moveTo(startX, startY);
    //   this.ctx.lineTo(endX, endY);
    //   this.ctx.stroke();
    //   this.ctx.setLineDash([]);
    // };

    // for (let i = 0; i < H; i += 20) {
    //   drawDashedLine(0, i, W, i);
    // }

    // for (let i = 0; i < W; i += 20) {
    //   drawDashedLine(i, 0, i, H);
    // }
  };
}
