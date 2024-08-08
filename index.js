import { intializeControls } from "./controls.js";
import { initializeCanvas } from "./canvas.js";
import { initializeEditor } from "./editor.js";

async function main() {
  const editor = await initializeEditor();

  intializeControls({
    onAddText: editor.addText,
  });

  const { startDrawing, stopDrawing } = await initializeCanvas(editor);

  startDrawing();

  setTimeout(() => {
    stopDrawing();
  }, 5000);
}

window.onload = () => {
  main();
};
