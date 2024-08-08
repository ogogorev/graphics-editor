export const FONTS = {
  SankofaDisplay: {
    name: "Sankofa Display",
    // "url('https://fonts.googleapis.com/css2?family=Sankofa+Display&display=swap')"
    // "url(https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2) format('woff2')"
    url: "https://fonts.gstatic.com/s/sankofadisplay/v2/Ktk1ALSRd4LucUDghJ2rTqXOoh3HEKOYd4xI5g.woff2",
  },
};

export function loadFont(fontInfo) {
  const font = new FontFace(
    fontInfo.name,
    `url(${fontInfo.url}) format('woff2')`
  );

  return font.load();
}
