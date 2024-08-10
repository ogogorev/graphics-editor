import { Text } from "./elements/text.js";
import { loadFonts } from "./fonts.js";
import { intializeControls } from "./controls.js";

const ACTIONS = {
  SelectedElement: "selected",
  Dragging: "dragging",
};

export class Editor {
  currentAction = [];
  activeElementI = -1;

  cursorX;
  cursorY;

  shouldUpdate = false;

  constructor(canvas) {
    this.elements = [];
    this.canvas = canvas;
  }

  init = async () => {
    await loadFonts();

    intializeControls({
      onAddText: this.addText,
    });

    this.canvas.addListeners({
      onMouseDown: this.handleMouseDown,
      onMouseMove: this.handleMouseMove,
      onMouseUp: this.handleMouseUp,
    });

    // Initial elements
    this.addText();
  };

  handleMouseDown = (event) => {
    this.cursorX = event.offsetX;
    this.cursorY = event.offsetY;

    const selectedI = this.getElementAtPos(this.cursorX, this.cursorY);

    console.log({ selectedI });

    if (selectedI > -1) {
      this.currentAction = [
        ACTIONS.Dragging,
        { x: this.cursorX, y: this.cursorY },
      ];
      this.activeElementI = selectedI;
    }

    this.startUpdating();
  };

  handleMouseMove = (event) => {
    if (this.currentAction[0]) {
      this.cursorX = event.offsetX;
      this.cursorY = event.offsetY;
    }
  };

  handleMouseUp = (event) => {
    this.stopUpdating();

    console.log("mouse up");

    if (this.currentAction[0] === ACTIONS.SelectedElement) {
      this.currentAction = [];
      this.activeElementI = -1;
    }

    if (this.currentAction[0] === ACTIONS.Dragging) {
      this.finishDragging();
      this.currentAction = [ACTIONS.SelectedElement];
    }

    this.cursorX = undefined;
    this.cursorY = undefined;

    this.update();
  };

  getElementAtPos = (x, y) => {
    for (let i = 0; i < this.elements.length; i++) {
      const box = this.elements[i].box;

      console.log("check", { x, y, box });

      if (x > box.x1 && y > box.y1 && x < box.x2 && y < box.y2) {
        return i;
      }
    }

    return -1;
  };

  finishDragging = () => {
    const dx = this.cursorX - this.currentAction[1].x;
    const dy = this.cursorY - this.currentAction[1].y;

    const activeElement = this.elements[this.activeElementI];

    console.log("finish dragging", {
      currentAction: this.currentAction,
      acX: activeElement.x,
      i: this.activeElementI,
      dx,
      dy,
    });

    activeElement.x = activeElement.x + dx;
    activeElement.y = activeElement.y + dy;

    activeElement.updateBox();
  };

  addText = () => {
    const text = new Text("Text", 100, 100);
    this.elements.push(text);

    this.update();
  };

  startUpdating = () => {
    this.shouldUpdate = true;
    this.update();
  };

  stopUpdating = () => {
    this.shouldUpdate = false;
  };

  update = () => {
    const cb = () => {
      this.doUpdate();

      if (this.shouldUpdate) {
        window.requestAnimationFrame(cb);
      }
    };

    window.requestAnimationFrame(cb);
  };

  doUpdate = () => {
    console.log("do update", {
      t: this,
      elements: this.elements,
      activeElementI: this.activeElementI,
      currentAction: this.currentAction,
    });

    this.canvas.reset();

    for (let i = 0; i < this.elements.length; i++) {
      if (i !== this.activeElementI) {
        this.canvas.drawElement(this.elements[i]);
      }
    }

    if (this.activeElementI < 0) {
      return;
    }

    const activeElement = this.elements[this.activeElementI];

    if (this.currentAction[0] === ACTIONS.Dragging) {
      const dx = this.cursorX - this.currentAction[1].x;
      const dy = this.cursorY - this.currentAction[1].y;

      this.canvas.drawActiveElement(activeElement, dx, dy);
    }

    if (this.currentAction[0] === ACTIONS.SelectedElement) {
      this.canvas.drawElement(activeElement);

      this.canvas.drawSelectionBox(
        activeElement.box.x1,
        activeElement.box.y1,
        activeElement.box.x2 - activeElement.box.x1,
        activeElement.box.y2 - activeElement.box.y1
      );
    }
  };
}
