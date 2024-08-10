import { FONTS, loadFont } from "./fonts.js";

const W = window.innerWidth;
const H = window.innerHeight;

function drawRect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

const DOT_WIDTH = 4;

function drawDot(ctx, color, x, y) {
  drawRect(ctx, color, x, y, DOT_WIDTH, DOT_WIDTH);
}

// async function drawInitialState(ctx) {
//   ctx.beginPath();
//   ctx.rect(0, 0, 150, 100);
//   ctx.fill();

//   const newFont = await loadFont();
//   document.fonts.add(newFont);

//   ctx.font = "72px Sankofa Display";
//   ctx.fillText("Hello world", 50, 150);

//   const res = await fetch(
//     "https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2"
//   );
//   const fontBuffer = res.arrayBuffer();

//   const font = await fontBuffer
//     .then((buffer) => Module.decompress(buffer))
//     .then((buffer) => opentype.parse(Uint8Array.from(buffer).buffer));

//   font.draw(ctx, "Hello world", 50, 300);

//   const p = font.getPath("Hello world", 50, 350);
//   const canvasPath = new Path2D(p.toPathData());

//   ctx.fill(canvasPath);

//   console.log("path", { p, canvasPath });

//   return canvasPath;
// }

// async function loadFonts() {
//   const sankofaDisplay = await loadFont(FONTS.SankofaDisplay);
//   document.fonts.add(sankofaDisplay);
// }

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

  // draw = (elements) => {
  //   // console.log("draw", this);

  //   // if (!this.shouldDraw) {
  //   //   return;
  //   // }

  //   console.log("draw", { elements });

  //   for (let i = 0; i < elements.length; i++) {
  //     this.drawElement(elements[i]);
  //   }

  //   // window.requestAnimationFrame(this.draw);
  // };
}

// const offscreenCanvas = new OffscreenCanvas(W, H);
// const offscreenContext = offscreenCanvas.getContext("2d");

// const canvasPath = await drawInitialState(offscreenContext);

/// ==========

// let rectX = 200;
// let rectY = 200;
// const RECT_W = 50;
// const RECT_H = 50;

// let start = 0;
// let elapsed = 0;

// addListeners(canvas);

// function draw(timestamp) {
//   console.log(timestamp);

//   ctx.reset();

//   ctx.drawImage(offscreenCanvas, 0, 0);

//   const d = timestamp - start;

//   rectX = rectX + 1;

//   let scaleX = 1;
//   let scaleY = 1;

//   if (mousePositionX) {
//     scaleX = mousePositionX / 300;
//     scaleY = mousePositionY / 300;
//   }

//   ctx.save();

//   ctx.scale(scaleX, scaleY);

//   ctx.beginPath();

//   // drawRect(ctx, "blue", mousePositionX, mousePositionY, RECT_W, RECT_H);
//   // ctx.translate(mousePositionX, mousePositionY);
//   ctx.fill(canvasPath);

//   // ctx.closePath();

//   ctx.restore();

//   start = timestamp;
//   elapsed += d;

//   if (elapsed < 20000) {
//     window.requestAnimationFrame(draw);
//   }
// }

// window.requestAnimationFrame(draw);
// }
