import { Text } from "./elements/text.js";
import { loadFonts } from "./fonts.js";
import { intializeControls } from "./controls.js";
import {
  ELEMENT_BOX_POSITION,
  getCursorForElementBoxPosition,
  getElementBoxPosition,
  getVectorByPosition,
  setDocumentCursor,
} from "./utils.js";

const ACTIONS = {
  Dragging: "Dragging",
  SelectedElement: "Selected",
  Resizing: "Resizing",
};

// TODO: Move away
const createDraggingAction = (x, y) => {
  return [ACTIONS.Dragging, { x, y }];
};

// TODO: Move away
const createSelectedElementAction = () => {
  return [ACTIONS.SelectedElement];
};

// TODO: Move away
const createResizingAction = (x, y, direction) => {
  return [ACTIONS.Resizing, { x, y, direction }];
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
      onKeyDown: this.handleKeyDown,
    });

    // Initial elements
    this.addText();
  };

  getActiveElement = () => {
    return this.elements[this.activeElementI];
  };

  setCurrentAction = (action) => {
    this.currentAction = action;
  };

  handleMouseDown = (event) => {
    this.cursorX = event.offsetX;
    this.cursorY = event.offsetY;

    const elementI = this.checkColisionsAtXY(this.cursorX, this.cursorY);

    console.log({ elementI });

    if (elementI > -1) {
      this.activeElementI = elementI;

      const position = getElementBoxPosition(
        this.cursorX,
        this.cursorY,
        this.elements[elementI].innerBox
      );

      if (position === ELEMENT_BOX_POSITION.InnerBox) {
        this.setCurrentAction(createDraggingAction(this.cursorX, this.cursorY));
      } else {
        this.setCurrentAction(
          createResizingAction(this.cursorX, this.cursorY, position)
        );
      }
    }

    this.startUpdating();
  };

  handleMouseMove = (event) => {
    if (this.currentAction[0]) {
      this.cursorX = event.offsetX;
      this.cursorY = event.offsetY;
    }

    // if (!this.currentAction[0]) {
    const elementI = this.checkColisionsAtXY(event.offsetX, event.offsetY);
    this.updateCursor(event.offsetX, event.offsetY, elementI);
    // }
  };

  handleMouseUp = (event) => {
    this.stopUpdating();

    console.log("mouse up");

    if (this.currentAction[0] === ACTIONS.SelectedElement) {
      this.deselectElement();
    }

    if (this.currentAction[0] === ACTIONS.Dragging) {
      this.finishDragging();
      this.selectElement(this.activeElementI);
    }

    if (this.currentAction[0] === ACTIONS.Resizing) {
      this.selectElement(this.activeElementI);
    }

    this.cursorX = undefined;
    this.cursorY = undefined;

    this.update();
  };

  handleKeyDown = (event) => {
    console.log("key down", event);

    if (this.currentAction[0] !== ACTIONS.SelectedElement) {
      return;
    }

    if (event.key === "Escape") {
      this.deselectElement();
      this.update();
      return;
    }

    const timeoutId = setTimeout(() => {
      this.getActiveElement().setLabel(event.target.value);
      this.update();

      clearTimeout(timeoutId);
    }, 0);
  };

  checkColisionsAtXY = (x, y) => {
    for (let i = 0; i < this.elements.length; i++) {
      const outerBox = this.elements[i].outerBox;

      if (
        x > outerBox.x1 &&
        y > outerBox.y1 &&
        x < outerBox.x2 &&
        y < outerBox.y2
      ) {
        return i;
      }
    }

    return -1;
  };

  updateCursor = (x, y, elementI) => {
    if (elementI < 0) {
      setDocumentCursor();
      return;
    }

    const innerBox = this.elements[elementI].innerBox;
    const position = getElementBoxPosition(x, y, innerBox);
    setDocumentCursor(getCursorForElementBoxPosition(position));
  };

  finishDragging = () => {
    const dx = this.cursorX - this.currentAction[1].x;
    const dy = this.cursorY - this.currentAction[1].y;

    const activeElement = this.elements[this.activeElementI];

    activeElement.x = activeElement.x + dx;
    activeElement.y = activeElement.y + dy;

    activeElement.updateBox();
  };

  selectElement = (i) => {
    this.activeElementI = i;
    this.currentAction = [ACTIONS.SelectedElement];

    if (this.getActiveElement().type === "text") {
      const input = document.getElementById("edit-text");
      input.addEventListener("keydown", this.handleKeyDown);

      input.value = this.getActiveElement().label;
      input.focus();
    }
  };

  deselectElement = () => {
    this.currentAction = [];
    this.activeElementI = -1;

    const input = document.getElementById("edit-text");
    input.value = "";

    input.removeEventListener("keydown", this.handleKeyDown);
  };

  addText = () => {
    const text = new Text("Text", 400, 100);
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
    // console.log("do update", {
    //   t: this,
    //   elements: this.elements,
    //   activeElementI: this.activeElementI,
    //   currentAction: this.currentAction,
    // });

    this.canvas.prepareFrame();

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
      const dx = activeElement.x + this.cursorX - this.currentAction[1].x;
      const dy = activeElement.y + this.cursorY - this.currentAction[1].y;

      this.canvas.drawElement(activeElement, dx, dy);
    }

    if (this.currentAction[0] === ACTIONS.SelectedElement) {
      this.canvas.drawElement(activeElement);

      this.canvas.drawSelectionBox(
        activeElement.outerBox.x1,
        activeElement.outerBox.y1,
        activeElement.outerBox.x2 - activeElement.outerBox.x1,
        activeElement.outerBox.y2 - activeElement.outerBox.y1
      );
    }

    if (this.currentAction[0] === ACTIONS.Resizing) {
      const { x: startX, y: startY, direction } = this.currentAction[1];

      // console.log(this.currentAction);

      // const scale = getScaleForElement(
      //   activeElement,
      //   x,
      //   y,
      //   this.cursorX,
      //   this.cursorY
      // );

      const [kX, kY] = getVectorByPosition(direction);

      const distX = (this.cursorX - startX) * kX;
      const distY = (this.cursorY - startY) * kY;

      const currW = activeElement.innerBox.x2 - activeElement.innerBox.x1;
      const currH = activeElement.innerBox.y2 - activeElement.innerBox.y1;

      const newW = currW + distX;
      const newH = currH + distY;

      const scale = [newW / currW, newH / currH];

      const box = activeElement.innerBox;

      let x = activeElement.x;
      let y = activeElement.y;

      console.log({ xBefore: x, x1: box.x1 });
      // console.log({ yBefore: y, y1: box.y1, kY, distY, scale: scale[1] });

      const scaleX = scale[0] - 1;
      const innerX = box.x1 - x;

      if (kX > 0) x = x - innerX * scaleX;
      if (kX < 0) x = x - innerX * scaleX - currW * scaleX;

      const scaleY = scale[1] - 1;
      const innerY = box.y1 - y;

      if (kY > 0) y = y - innerY * scaleY;
      if (kY < 0) y = y - innerY * scaleY - currH * scaleY;

      console.log({ xAfter: x, scaleX, currW, innerX });
      // console.log({ yAfter: y, scaleY, currH, innerY });

      this.canvas.drawElement(activeElement, x, y, scale[0], scale[1]);

      // this.canvas.drawDashedLine(box.x2, box.y2, box.x2 - 1000, box.y2);
      // this.canvas.drawDashedLine(box.x2, box.y2, box.x2, box.y2 - 100);

      // this.canvas.drawSelectionBox(
      //   activeElement.outerBox.x1,
      //   activeElement.outerBox.y1,
      //   activeElement.outerBox.x2 - activeElement.outerBox.x1,
      //   activeElement.outerBox.y2 - activeElement.outerBox.y1
      // );

      // this.canvas.drawSelectionBox(
      //   activeElement.x,
      //   activeElement.y,
      //   activeElement.outerBox.x2 - activeElement.outerBox.x1,
      //   activeElement.outerBox.y2 - activeElement.outerBox.y1
      // );

      const x1 = activeElement.innerBox.x1;
      const y1 = activeElement.innerBox.y1;
      const x2 = activeElement.innerBox.x2 * scale[0];
      const y2 = activeElement.innerBox.y2 * scale[1];

      // this.canvas.drawSelectionBox(x1, y1, x2 - x1, y2 - y1);

      // this.canvas.drawSelectionBox(
      //   activeElement.outerBox.x1,
      //   activeElement.outerBox.y1,
      //   scale[0] * (activeElement.outerBox.x2 - activeElement.outerBox.x1),
      //   scale[1] * (activeElement.outerBox.y2 - activeElement.outerBox.y1)
      // );
    }
  };
}

/**
 *
 * TODO:
 *  - Save scale for element after resizing
 *  - Do not allow resizing if element is not selected
 *  - Draw selection box properly
 *
 */
