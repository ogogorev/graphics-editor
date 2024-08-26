import { Canvas } from "./canvas.js";
import { Editor } from "./editor.js";

async function main() {
  const canvas = new Canvas("canvas");

  const editor = new Editor(canvas);
  await editor.init();
}

window.onload = () => {
  main();
};
