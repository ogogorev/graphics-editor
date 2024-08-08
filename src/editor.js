import { createText } from "./elements/text.js";
import { FONTS, loadedFonts, loadFonts } from "./fonts.js";

export class Editor {
  constructor() {
    this.elements = [];
  }

  init = async () => {
    await loadFonts();
  };

  addText = () => {
    const text = createText("Test", loadedFonts[FONTS.SankofaDisplay.id]);

    this.elements.push({
      type: "text",
      text,
      x: 100,
      y: 100,
    });
  };
}
