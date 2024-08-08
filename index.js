import { intializeControls } from "./controls.js";
import { initializeCanvas } from "./canvas.js";

async function main() {
  function addText() {
    console.log("add text");
  }

  intializeControls({
    onAddText: addText,
  });

  await initializeCanvas();
}

window.onload = () => {
  main();
};
