import {
  SELECTION_BOX_CONTROL_POINT_SIZE,
  SELECTION_BOX_OFFSET,
  SELECTION_COLOR,
} from "./consts";
import { Box, Element, ElementType, Font } from "./types";

const W = window.innerWidth;
const H = window.innerHeight;

export class Canvas {
  cnv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  offscreenCanvas: OffscreenCanvas;

  constructor(canvasId: string) {
    this.cnv = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!this.cnv) {
      throw new Error(`Canvas with id ${canvasId} not found`);
    }

    const dpi = window.devicePixelRatio;

    this.cnv.style.width = W + "px";
    this.cnv.style.height = H + "px";

    this.cnv.width = W * dpi;
    this.cnv.height = H * dpi;

    this.ctx = this.cnv.getContext("2d")!;

    this.offscreenCanvas = new OffscreenCanvas(W * dpi, H * dpi);
  }

  addListeners = (handlers: {
    onMouseDown: (e: MouseEvent) => void;
    onMouseMove: (e: MouseEvent) => void;
    onMouseUp: (e: MouseEvent) => void;
    onWheel: (e: WheelEvent) => void;
  }) => {
    this.cnv.addEventListener("mousedown", handlers.onMouseDown);
    this.cnv.addEventListener("mousemove", handlers.onMouseMove);
    this.cnv.addEventListener("mouseup", handlers.onMouseUp);

    this.cnv.addEventListener("wheel", handlers.onWheel);
  };

  get w() {
    return W;
  }

  get h() {
    return H;
  }

  drawRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    fillColor?: string,
    strokeColor?: string
  ) => {
    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fillRect(x, y, w, h);
    }

    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.strokeRect(x, y, w, h);
    }
  };

  drawTextWithFont = (font: Font, label: string, x: number, y: number) => {
    font.draw(this.ctx, label, x, y);
  };

  drawSelectionBox = (box: Box) => {
    const x = box.x1;
    const y = box.y1;
    const w = box.x2 - box.x1;
    const h = box.y2 - box.y1;

    this.drawRect(
      x + SELECTION_BOX_OFFSET,
      y + SELECTION_BOX_OFFSET,
      w - SELECTION_BOX_OFFSET * 2,
      h - SELECTION_BOX_OFFSET * 2,
      undefined,
      SELECTION_COLOR
    );

    this.drawRect(
      x,
      y,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      x + w - SELECTION_BOX_CONTROL_POINT_SIZE,
      y,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      x,
      y + h - SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );

    this.drawRect(
      x + w - SELECTION_BOX_CONTROL_POINT_SIZE,
      y + h - SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      SELECTION_BOX_CONTROL_POINT_SIZE,
      "white",
      SELECTION_COLOR
    );
  };

  drawElementContent = (element: Element) => {
    if (element.type === ElementType.Text) {
      this.drawTextWithFont(element.font, element.label, 0, element.fontSize);
    }
  };

  drawElement = (
    element: Element,
    x?: number,
    y?: number,
    scaleX?: number,
    scaleY?: number
  ) => {
    this.ctx.save();

    this.ctx.translate(x ?? element.x, y ?? element.y);
    this.ctx.scale(scaleX ?? element.scaleX, scaleY ?? element.scaleY);

    this.drawElementContent(element);

    this.ctx.restore();
  };

  drawDashedLine = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
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

  restoreTransform = () => {
    this.ctx.restore();
  };

  prepareFrameOnCtx = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    zoom: number,
    x: number,
    y: number
  ) => {
    ctx.reset();

    const dpi = window.devicePixelRatio;

    ctx.scale(dpi, dpi);
    ctx.save();

    ctx.scale(zoom, zoom);
    ctx.translate(x, y);
  };

  prepareFrame = (zoom: number, x: number, y: number) => {
    this.prepareFrameOnCtx(this.ctx, zoom, x, y);
  };

  prepareStaticFrame = (zoom: number, x: number, y: number) => {
    this.ctx = this.offscreenCanvas.getContext("2d")!;
    this.prepareFrameOnCtx(this.offscreenCanvas.getContext("2d")!, zoom, x, y);
  };

  finishStaticFrame = () => {
    this.ctx = this.cnv.getContext("2d")!;
  };

  drawStaticFrame = (zoom: number, x: number, y: number) => {
    this.ctx.drawImage(
      this.offscreenCanvas,
      0,
      0,
      W * window.devicePixelRatio,
      H * window.devicePixelRatio,
      -x,
      -y,
      W / zoom,
      H / zoom
    );
  };
}
