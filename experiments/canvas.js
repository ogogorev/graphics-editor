// const W = window.innerWidth;
// const H = window.innerHeight;

const W = 800;
const H = 800;

async function loadFont() {
  const font = new FontFace(
    "Sankofa Display",
    // "url('https://fonts.googleapis.com/css2?family=Sankofa+Display&display=swap')"
    "url(https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2) format('woff2')"
  );
  return font.load();
}

function drawRect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

const DOT_WIDTH = 4;

function drawDot(ctx, color, x, y) {
  drawRect(ctx, color, x, y, DOT_WIDTH, DOT_WIDTH);
}

let mousePositionX;
let mousePositionY;

const drawDashedLine = (ctx, color, startX, startY, endX, endY) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);
};

export async function main() {
  console.log({ w: window.innerWidth, k: window.innerHeight });

  const cnv = document.querySelector("#canvas");

  cnv.style.width = W + "px";
  cnv.style.height = H + "px";

  const dpi = window.devicePixelRatio;

  cnv.width = W * dpi;
  cnv.height = H * dpi;

  const ctx = cnv.getContext("2d");
  ctx.scale(dpi, dpi);

  for (let i = 0; i < W; i += 100) {
    drawDashedLine(ctx, "green", i, 0, i, i + H);
  }

  const RECT = [350, 0, 100, 100];

  const ZOOM = 0.25;
  const TRANSLATE_X = 1200;
  const TRANSLATE_Y = 0;
  // const TRANSLATE_X = -(W / ZOOM / 2);
  // const TRANSLATE_Y = 0;

  ctx.scale(ZOOM, ZOOM);
  ctx.translate(TRANSLATE_X, TRANSLATE_Y);

  drawDashedLine(ctx, "black", 0, 0, W, 0);
  drawDashedLine(ctx, "black", 0, 0, 0, H);

  drawRect(ctx, "red", ...RECT);

  /////// ========= OFFSCREEN =========

  const offscreenCanvas = new OffscreenCanvas(W * dpi, H * dpi);
  const offscreenContext = offscreenCanvas.getContext("2d");

  offscreenContext.fillStyle = "#DDDDDD";
  offscreenContext.fillRect(0, 0, W * dpi, H * dpi);
  // offscreenContext.fillRect(0, 0, W, H);

  offscreenContext.scale(dpi, dpi);
  offscreenContext.scale(ZOOM, ZOOM);
  offscreenContext.translate(TRANSLATE_X, TRANSLATE_Y);

  drawRect(offscreenContext, "blue", ...RECT);

  ctx.drawImage(
    offscreenCanvas,
    0,
    0,
    W * dpi,
    H * dpi,
    -TRANSLATE_X,
    100,
    W / ZOOM,
    H / ZOOM
  );

  /// ==========
}

// main();

///// ==========

//   function draw(timestamp) {
//     console.log(timestamp);

//     ctx.reset();

//     ctx.drawImage(offscreenCanvas, 0, 0);

//     const d = timestamp - start;

//     rectX = rectX + 1;

//     ctx.beginPath();
//     drawRect(ctx, "blue", mousePositionX, mousePositionY, RECT_W, RECT_H);
//     ctx.translate(mousePositionX, mousePositionY);
//     ctx.fill(canvasPath);
//     ctx.closePath();

//     start = timestamp;
//     elapsed += d;

//     if (elapsed < 20000) {
//       window.requestAnimationFrame(draw);
//     }
//   }
