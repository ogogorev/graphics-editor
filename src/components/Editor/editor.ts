import { Text, isText } from "./elements/Text";
// @ts-expect-error
import { loadFonts } from "./fonts";
import { intializeControls } from "./controls";
import {
  getCursorForElementBoxPosition,
  getElementBoxPosition,
  setDocumentCursor,
  calculateResizedElementPosition,
  expandBox,
  getInnerBox,
  isPointInBox,
  transformBox,
} from "./utils";
import { ElementBoxPosition, OUTER_BOX_OFFSET } from "./consts";
import { Canvas } from "./canvas";
import {
  DraggingAction,
  EditorAction,
  EditorActionType,
  Element,
  ElementType,
  MovingCanvasAction,
  Position,
  ResizingAction,
} from "./types";
import { KeyboardEvent } from "react";

// TODO: Move to consts
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 8;

// TODO: Move away
const createDraggingAction = (x: number, y: number): DraggingAction => {
  return [EditorActionType.Dragging, { x, y }];
};

// TODO: Move away
// TODO: Unomment
// const createSelectedElementAction = () => {
//   return [ACTIONS.SelectedElement];
// };

// TODO: Move away
const createResizingAction = (
  x: number,
  y: number,
  direction: ElementBoxPosition
): ResizingAction => {
  return [EditorActionType.Resizing, { x, y, direction }];
};

// TODO: Move away
const createMovingCanvasAction = (x: number, y: number): MovingCanvasAction => {
  return [EditorActionType.MovingCanvas, { startX: x, startY: y }];
};

export class Editor {
  canvas: Canvas;

  elements: Element[];
  activeElementI = -1;

  currentAction: EditorAction | [] = [];

  // TODO: define a var with mouse pos and in canvas position?
  // TODO: Consider initializing to undefined
  // and having a function to throw an error if cursor is not set
  cursorX = -1;
  cursorY = -1;

  zoom = 1;

  viewportOffsetX = 0;
  viewportOffsetY = 0;

  shouldUpdate = false;

  elementsHash = "";

  constructor(canvas: Canvas) {
    this.elements = [];
    this.canvas = canvas;
  }

  init = async () => {
    try {
      await loadFonts();
    } catch (error) {
      console.error("Failed to load fonts", error);
    }

    intializeControls({
      onAddText: () => {
        this.addText();
      },
      onZoomIn: this.handleZoomInClick,
      onZoomOut: this.handleZoomOutClick,
    });

    this.canvas.addListeners({
      onMouseDown: this.handleMouseDown,
      onMouseMove: this.handleMouseMove,
      onMouseUp: this.handleMouseUp,
      onWheel: this.handleWheel,
    });

    const label = "Random";
    const x = 800;
    const y = 200;

    const text = new Text(label, x, y);

    this.elements.push(text);

    // Initial elements
    this.addText();
  };

  getActiveElement = () => {
    return this.elements[this.activeElementI];
  };

  setCurrentAction = (action: EditorAction) => {
    this.currentAction = action;
  };

  updateViewport = (
    zoom?: number,
    dx?: number,
    dy?: number,
    focusX?: number,
    focusY?: number
  ) => {
    // Deliberately assuming that zoom is not provided in such a case
    if (dx != null && dy != null) {
      this.viewportOffsetX -= dx;
      this.viewportOffsetY -= dy;
      return;
    }

    focusX = focusX ?? this.canvas.w / 2;
    focusY = focusY ?? this.canvas.h / 2;

    const ratioX = focusX / this.canvas.w;
    const ratioY = focusY / this.canvas.h;

    const currW = this.canvas.w / this.zoom;
    const currH = this.canvas.h / this.zoom;

    const zoomedFocusX = this.viewportOffsetX + ratioX * currW;
    const zoomedFocusY = this.viewportOffsetY + ratioY * currH;

    zoom = zoom ?? this.zoom;
    zoom = Math.max(Math.min(zoom, MAX_ZOOM), MIN_ZOOM);

    const newW = this.canvas.w / zoom;
    const newH = this.canvas.h / zoom;

    const newOffsetX = zoomedFocusX - ratioX * newW;
    const newOffsetY = zoomedFocusY - ratioY * newH;

    console.log("updateViewport", { zoom, focusX, newW, newOffsetX });

    this.zoom = zoom;
    this.viewportOffsetX = newOffsetX;
    this.viewportOffsetY = newOffsetY;
  };

  getPhysicalX = (x: number) =>
    ((x - this.viewportOffsetX) * this.canvas.w) / (this.canvas.w / this.zoom);

  getPhysicalY = (y: number) =>
    ((y - this.viewportOffsetY) * this.canvas.h) / (this.canvas.h / this.zoom);

  getPhysicalPosition = (x: number, y: number): Position => [
    this.getPhysicalX(x),
    this.getPhysicalY(y),
  ];

  getLogicalPosition = (x: number, y: number): Position => {
    return [
      this.viewportOffsetX + x / this.zoom,
      this.viewportOffsetY + y / this.zoom,
    ];
  };

  setCursorPosition = (x?: number, y?: number) => {
    if (x == null || y == null) {
      this.cursorX = -1;
      this.cursorY = -1;
      return;
    }

    const canvasPosition = this.getLogicalPosition(x, y);
    this.cursorX = canvasPosition[0];
    this.cursorY = canvasPosition[1];
  };

  handleZoomInClick = () => {
    this.updateViewport(this.zoom * 2);
    this.update();
  };

  handleZoomOutClick = () => {
    this.updateViewport(this.zoom / 2);
    this.update();
  };

  handleMouseDown = (event: MouseEvent) => {
    this.setCursorPosition(event.offsetX, event.offsetY);

    const elementI = this.checkColisionsAtXY(this.cursorX, this.cursorY);

    console.log({ elementI });

    if (elementI > -1) {
      this.activeElementI = elementI;

      const position = getElementBoxPosition(
        this.cursorX,
        this.cursorY,
        this.elements[elementI].innerBox
      );

      if (position === ElementBoxPosition.InnerBox) {
        this.startDragging();
      } else if (this.currentAction[0] === EditorActionType.SelectedElement) {
        this.setCurrentAction(
          createResizingAction(this.cursorX, this.cursorY, position)
        );
      }
    } else {
      this.activeElementI = -1;
      this.setCurrentAction(
        createMovingCanvasAction(this.cursorX, this.cursorY)
      );
    }

    this.startUpdating();
  };

  handleMouseMove = (event: MouseEvent) => {
    if (this.currentAction[0]) {
      this.setCursorPosition(event.offsetX, event.offsetY);
    }

    this.updateCursor(...this.getLogicalPosition(event.offsetX, event.offsetY));
  };

  handleMouseUp = () => {
    this.stopUpdating();

    console.log("mouse up");

    if (this.currentAction[0] === EditorActionType.SelectedElement) {
      this.deselectElement();
    }

    if (this.currentAction[0] === EditorActionType.Dragging) {
      this.finishDragging();
      this.selectElement(this.activeElementI);
    }

    if (this.currentAction[0] === EditorActionType.Resizing) {
      this.finishResizing();
      this.selectElement(this.activeElementI);
    }

    if (this.currentAction[0] === EditorActionType.MovingCanvas) {
      this.finishMovingCanvas();
    }

    this.setCursorPosition();

    this.update();
  };

  handleWheel = (event: WheelEvent) => {
    console.log("wheel", event);

    this.updateViewport(
      this.zoom - event.deltaY * 0.01,
      undefined,
      undefined,
      event.offsetX,
      event.offsetY
    );

    if (!this.shouldUpdate) {
      this.startUpdating();

      const timeoutId = setTimeout(() => {
        clearTimeout(timeoutId);
        this.stopUpdating();
      }, 100);
    }
  };

  handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    console.log("key down", event);

    if (this.currentAction[0] !== EditorActionType.SelectedElement) {
      return;
    }

    if (event.key === "Escape") {
      this.deselectElement();
      this.update();
      return;
    }

    const timeoutId = setTimeout(() => {
      const activeElement = this.getActiveElement();

      if (isText(activeElement)) {
        activeElement.setLabel(event.currentTarget.value);

        this.update();
      }

      clearTimeout(timeoutId);
    }, 0);
  };

  checkColisionsAtXY = (x: number, y: number) => {
    for (let i = 0; i < this.elements.length; i++) {
      const outerBox = expandBox(
        this.elements[i].innerBox,
        OUTER_BOX_OFFSET / this.zoom
      );

      if (isPointInBox(x, y, outerBox)) return i;
    }

    return -1;
  };

  updateCursor = (x: number, y: number) => {
    if (
      this.currentAction[0] === EditorActionType.Dragging ||
      this.currentAction[0] === EditorActionType.Resizing
    ) {
      return;
    }

    if (this.currentAction[0] === EditorActionType.MovingCanvas) {
      setDocumentCursor("all-scroll");
      return;
    }

    const elementI = this.checkColisionsAtXY(x, y);

    if (elementI < 0) {
      setDocumentCursor();
      return;
    }

    if (!this.currentAction[0]) {
      setDocumentCursor("grab");
    }

    if (this.currentAction[0] === EditorActionType.SelectedElement) {
      const innerBox = this.elements[elementI].innerBox;
      const position = getElementBoxPosition(x, y, innerBox);
      setDocumentCursor(getCursorForElementBoxPosition(position));
    }
  };

  startDragging = () => {
    this.setCurrentAction(createDraggingAction(this.cursorX, this.cursorY));
    setDocumentCursor("grabbing");
  };

  finishDragging = () => {
    if (this.currentAction[0] !== EditorActionType.Dragging) return;

    const dx = this.cursorX - this.currentAction[1].x;
    const dy = this.cursorY - this.currentAction[1].y;

    const activeElement = this.elements[this.activeElementI];

    // TODO: Use setProps here

    activeElement.x = activeElement.x + dx;
    activeElement.y = activeElement.y + dy;

    // TODO: This call is probably not needed here
    // @ts-expect-error
    activeElement.updateBox();
  };

  finishResizing = () => {
    if (this.currentAction[0] !== EditorActionType.Resizing) return;

    const activeElement = this.getActiveElement();

    if (!isText(activeElement)) return;

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

  finishMovingCanvas = () => {
    if (this.currentAction[0] !== EditorActionType.MovingCanvas) return;

    const dx = this.cursorX - this.currentAction[1].startX;
    const dy = this.cursorY - this.currentAction[1].startY;

    this.updateViewport(undefined, dx, dy);
    this.currentAction = [];
  };

  selectElement = (i: number) => {
    this.activeElementI = i;
    // TODO: Use function for action creation here
    this.currentAction = [EditorActionType.SelectedElement];

    if (isText(this.getActiveElement())) {
      const input = document.getElementById("edit-text") as HTMLInputElement;

      if (!input) return;
      // @ts-expect-error
      input.addEventListener("keydown", this.handleKeyDown);

      input.value = this.getActiveElement().label;
      input.focus();
    }
  };

  deselectElement = () => {
    this.currentAction = [];
    this.activeElementI = -1;

    const input = document.getElementById("edit-text") as HTMLInputElement;

    if (input) {
      input.value = "";

      // @ts-expect-error
      input.removeEventListener("keydown", this.handleKeyDown);
    }
  };

  addText = (label = "Text", x = 400, y = 100) => {
    const text = new Text(label, x, y);
    this.elements.push(text);

    this.selectElement(this.elements.length - 1);

    this.update();
  };

  startUpdating = () => {
    if (!this.shouldUpdate) {
      this.shouldUpdate = true;
      this.update();
    }
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
    console.log("do update");

    ////// PREPARE FRAME //////

    let frameOffsetX = this.viewportOffsetX;
    let frameOffsetY = this.viewportOffsetY;

    if (this.currentAction[0] === EditorActionType.MovingCanvas) {
      frameOffsetX -= this.cursorX - this.currentAction[1].startX;
      frameOffsetY -= this.cursorY - this.currentAction[1].startY;
    }

    this.canvas.prepareFrame(this.zoom, -frameOffsetX, -frameOffsetY);

    ////// DRAW STATIC ELEMENTS //////

    const staticElements = this.elements.filter(
      (_, i) => i !== this.activeElementI
    );

    const nextElementsHash = getRenderingHash(
      staticElements,
      this.zoom,
      -frameOffsetX,
      -frameOffsetY
    );

    if (nextElementsHash !== this.elementsHash) {
      this.elementsHash = nextElementsHash;

      this.canvas.prepareStaticFrame(this.zoom, -frameOffsetX, -frameOffsetY);

      for (let i = 0; i < staticElements.length; i++) {
        this.canvas.drawElement(staticElements[i]);
      }

      this.canvas.finishStaticFrame();
    }

    this.canvas.drawStaticFrame(this.zoom, -frameOffsetX, -frameOffsetY);

    ////// DRAW ACTIVE ELEMENT //////

    if (this.activeElementI < 0) {
      return;
    }

    const activeElement = this.elements[this.activeElementI];

    // TODO: Create helper function for checking action types
    if (this.currentAction[0] === EditorActionType.Dragging) {
      const dx = activeElement.x + this.cursorX - this.currentAction[1].x;
      const dy = activeElement.y + this.cursorY - this.currentAction[1].y;

      this.canvas.drawElement(activeElement, dx, dy);
    }

    if (this.currentAction[0] === EditorActionType.SelectedElement) {
      this.canvas.drawElement(activeElement);

      this.canvas.restoreTransform();

      const transformedBox = transformBox(
        activeElement.innerBox,
        this.getPhysicalPosition
      );
      const selectionBox = expandBox(transformedBox, OUTER_BOX_OFFSET);
      this.canvas.drawSelectionBox(selectionBox);
    }

    if (this.currentAction[0] === EditorActionType.Resizing) {
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

      this.canvas.restoreTransform();

      const innerBox = getInnerBox(
        x,
        y,
        activeElement.localBox,
        scaleX,
        scaleY
      );
      const transformedBox = transformBox(innerBox, this.getPhysicalPosition);
      const selectionBox = expandBox(transformedBox, OUTER_BOX_OFFSET);
      this.canvas.drawSelectionBox(selectionBox);
    }
  };
}

// TODO: Move somewhere
const getRenderingHash = (
  elements: Element[],
  zoom: number,
  x: number,
  y: number
) => {
  let str = String(zoom + x + y);

  for (let i = 0; i < elements.length; i++) {
    str += getRenderingHashForElement(elements[i]);
  }

  return str;
};

const getRenderingHashForElement = (element: Element) => {
  if (element.type === ElementType.Text) {
    return [
      element.x,
      element.y,
      element.scaleX,
      element.scaleY,
      element.localBox.x1,
      element.localBox.y1,
      element.localBox.x2,
      element.localBox.y2,
    ].join("");
  }

  return "";
};
