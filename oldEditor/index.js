import { Canvas } from "../src/components/Editor/canvas.js";
import { Editor } from "../src/components/Editor/editor.js";

async function main() {
  const canvas = new Canvas("canvas");

  const editor = new Editor(canvas);
  await editor.init();
}

window.onload = () => {
  main();
};
