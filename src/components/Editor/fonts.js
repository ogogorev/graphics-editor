import opentype from "opentype.js";
// import wawoff2 from "wawoff2";

export const FONTS = {
  SankofaDisplay: {
    id: "SankofaDisplay",
    name: "Sankofa Display",
    // "url('https://fonts.googleapis.com/css2?family=Sankofa+Display&display=swap')"
    // "url(https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2) format('woff2')"
    url: "https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2",
    // url: "/fonts/Roboto-Regular.ttf",
  },
};

export const loadedFonts = {};

// export async function loadFont(fontInfo) {
//   const res = await fetch(fontInfo.url);
//   const fontBuffer = res.arrayBuffer();

//   console.log({ fontBuffer });

//   const font = opentype.parse(await fontBuffer);

//   loadedFonts[fontInfo.id] = font;
// }

export async function loadFont(fontInfo) {
  try {
    const res = await fetch(fontInfo.url);
    const fontBuffer = res.arrayBuffer();

    const font = await fontBuffer
      .then((buffer) => Module.decompress(buffer))
      .then((buffer) => opentype.parse(Uint8Array.from(buffer).buffer));

    loadedFonts[fontInfo.id] = font;
  } catch (e) {
    console.error(e);
  }
}

export async function loadFonts() {
  await loadFont(FONTS.SankofaDisplay);
}
