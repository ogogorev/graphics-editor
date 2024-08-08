import { intializeControls } from "./controls.js";
import { Canvas } from "./canvas.js";
import { Editor } from "./editor.js";

async function main() {
  const editor = new Editor();
  await editor.init();

  intializeControls({
    onAddText: editor.addText,
  });

  const canvas = new Canvas("canvas", editor);

  canvas.startDrawing();

  setTimeout(() => {
    canvas.stopDrawing();
  }, 5000);
}

window.onload = () => {
  main();
};
