import opentype from "opentype.js";

import robotoUrl from "/src/assets/fonts/Roboto-Regular.ttf";
import sankofaDisplayUrl from "/src/assets/fonts/SankofaDisplay-Regular.ttf";

export const FONTS = {
  SankofaDisplay: {
    id: "SankofaDisplay",
    name: "Sankofa Display",
    url: sankofaDisplayUrl,
  },
  Roboto: {
    id: "Roboto",
    name: "Roboto",
    url: robotoUrl,
  },
};

export const loadedFonts = {};

export async function loadFont(fontInfo) {
  const res = await fetch(fontInfo.url);
  const fontBuffer = res.arrayBuffer();

  console.log({ fontBuffer });

  const font = opentype.parse(await fontBuffer);

  loadedFonts[fontInfo.id] = font;
}

export async function loadFonts() {
  await Promise.all(Object.values(FONTS).map(loadFont));
}
