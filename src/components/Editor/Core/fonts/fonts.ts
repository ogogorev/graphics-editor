// @ts-expect-error missing type declaration
import opentype from "opentype.js";

import robotoUrl from "/src/assets/fonts/Roboto-Regular.ttf";
import sankofaDisplayUrl from "/src/assets/fonts/SankofaDisplay-Regular.ttf";

import { FontId, FontInfo, OpentypeFont } from "./types";

export const FONTS: Record<FontId, FontInfo> = {
  [FontId.SankofaDisplay]: {
    id: FontId.SankofaDisplay,
    name: "Sankofa Display",
    url: sankofaDisplayUrl,
  },
  [FontId.Roboto]: {
    id: FontId.Roboto,
    name: "Roboto",
    url: robotoUrl,
  },
};

export const loadedFonts: Partial<Record<FontId, OpentypeFont>> = {};

export async function loadFont(fontInfo: FontInfo) {
  const res = await fetch(fontInfo.url);
  const fontBuffer = res.arrayBuffer();

  console.log({ fontBuffer });

  const font = opentype.parse(await fontBuffer);

  loadedFonts[fontInfo.id] = font;
}

export async function loadFonts() {
  await Promise.all(Object.values(FONTS).map(loadFont));
}
