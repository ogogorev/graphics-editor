const W = window.innerWidth;
const H = window.innerHeight;

export class Canvas {
  constructor(canvasId) {
    console.log({ w: window.innerWidth, k: window.innerHeight });

    this.cnv = document.getElementById(canvasId);

    this.cnv.width = W;
    this.cnv.height = H;

    this.ctx = this.cnv.getContext("2d");
  }

  addListeners = (handlers) => {
    this.cnv.addEventListener("mousedown", handlers.onMouseDown);
    this.cnv.addEventListener("mousemove", handlers.onMouseMove);
    this.cnv.addEventListener("mouseup", handlers.onMouseUp);
  };

  drawElement = (element) => {
    if (element.type === "text") {
      this.drawText(element.font, element.label, element.x, element.y);
    }
  };

  drawText = (font, label, x, y) => {
    font.draw(this.ctx, label, x, y);
  };

  drawActiveElement = (element, x, y) => {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.drawElement(element);
    this.ctx.restore();
  };

  reset = () => {
    this.ctx.reset();
  };
}
