import { Text } from "./elements/text.js";
import { loadFonts } from "./fonts.js";
import { intializeControls } from "./controls.js";
import {
  getCursorForElementBoxPosition,
  getElementBoxPosition,
  setDocumentCursor,
} from "./utils.js";
import { calculateResizedElementPosition, getOuterBox } from "./geometry.js";
import { ELEMENT_BOX_POSITION, OUTER_BOX_OFFSET } from "./consts.js";

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
      this.finishResizing();
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

    // TODO: Use setProps here

    activeElement.x = activeElement.x + dx;
    activeElement.y = activeElement.y + dy;

    activeElement.updateBox();
  };

  finishResizing = () => {
    const activeElement = this.getActiveElement();
    activeElement.setProps(
      ...calculateResizedElementPosition(
        activeElement,
        this.currentAction[1].direction,
        this.cursorX,
        this.cursorY,
        this.currentAction[1].x,
        this.currentAction[1].y
      )
    );

    this.currentAction = [];
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

      const [x, y, scaleX, scaleY] = calculateResizedElementPosition(
        activeElement,
        direction,
        this.cursorX,
        this.cursorY,
        startX,
        startY
      );

      this.canvas.drawElement(activeElement, x, y, scaleX, scaleY);

      const outerBox = getOuterBox(
        x,
        y,
        activeElement.localBox,
        scaleX,
        scaleY,
        OUTER_BOX_OFFSET
      );

      this.canvas.drawSelectionBox(
        outerBox.x1,
        outerBox.y1,
        outerBox.x2 - outerBox.x1,
        outerBox.y2 - outerBox.y1
      );
    }
  };
}

/**
 *
 * TODO:
 *  - Do not allow resizing if element is not selected
 *
 */
