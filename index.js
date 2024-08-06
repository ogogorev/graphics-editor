async function loadFont() {
  const font = new FontFace(
    "Sankofa Display",
    // "url('https://fonts.googleapis.com/css2?family=Sankofa+Display&display=swap')"
    "url(https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2) format('woff2')"
  );
  return font.load();
}

async function main() {
  console.log({ w: window.innerWidth, k: window.innerHeight });

  const cnv = document.querySelector("#canvas");

  cnv.width = window.innerWidth;
  cnv.height = window.innerHeight;

  const ctx = cnv.getContext("2d");

  ctx.beginPath();
  ctx.rect(0, 0, 150, 100);
  ctx.fill();

  const newFont = await loadFont();
  document.fonts.add(newFont);

  ctx.font = "72px Sankofa Display";
  ctx.fillText("Hello world", 50, 150);

  const res = await fetch(
    "https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2"
  );
  const fontBuffer = res.arrayBuffer();

  const font = await fontBuffer
    .then((buffer) => Module.decompress(buffer))
    .then((buffer) => opentype.parse(Uint8Array.from(buffer).buffer));

  font.draw(ctx, "Hello world", 50, 300);

  const p = font.getPath("Hello world", 50, 350);
  const canvasPath = new Path2D(p.toPathData());

  ctx.fill(canvasPath);

  console.log("path", { p, canvasPath });
}

window.onload = () => {
  main();
};

// main();
