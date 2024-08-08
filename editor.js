import { FONTS, loadedFonts, loadFonts } from "./fonts.js";
import { createText } from "./elements/text.js";

export async function initializeEditor() {
  const elements = [];

  await loadFonts();

  function addText() {
    const text = createText("Test", loadedFonts[FONTS.SankofaDisplay.id]);

    elements.push({
      type: "text",
      text,
      x: 100,
      y: 100,
    });
  }

  return {
    elements,
    addText,
  };
}
