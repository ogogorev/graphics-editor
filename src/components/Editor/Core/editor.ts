import { KeyboardEvent } from "react";

import { Text, isText } from "./elements/Text";
import { loadFonts } from "./fonts/fonts";
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
  getRenderingHash,
} from "./utils";
import {
  ElementBoxPosition,
  MAX_ZOOM,
  MIN_ZOOM,
  OUTER_BOX_OFFSET,
} from "./consts";
import { Canvas } from "./canvas";
import { Position } from "./types";
import {
  createDraggingAction,
  createMovingCanvasAction,
  createResizingAction,
  createSelectedElementAction,
  isActionSet,
  isDraggingAction,
  isMovingCanvasAction,
  isResizingAction,
  isSelectedElementAction,
} from "./actions";
import {
  getCurrentAction,
  setCurrentAction,
  resetCurrentAction,
  addElement,
  setActiveElementIndex,
  getActiveElement,
  resetActiveElement,
  getActiveElementIndex,
  getElements,
  getStaticElements,
  $renderingKey,
} from "./state";

export class Editor {
  canvas: Canvas;

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

    const text = new Text(label, "red", x, y);

    addElement(text);

    // Initial elements
    this.addText();

    $renderingKey.listen(() => {
      this.update();
    });
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

  // TODO: Set actions in mouse move first
  handleMouseDown = (event: MouseEvent) => {
    this.setCursorPosition(event.offsetX, event.offsetY);

    const elementI = this.checkColisionsAtXY(this.cursorX, this.cursorY);

    console.log({ elementI });

    if (elementI > -1) {
      setActiveElementIndex(elementI);

      const activeElement = getActiveElement();

      const position = getElementBoxPosition(
        this.cursorX,
        this.cursorY,
        activeElement.innerBox
      );

      if (position === ElementBoxPosition.InnerBox) {
        this.startDragging();
      } else if (isSelectedElementAction(getCurrentAction())) {
        setCurrentAction(
          createResizingAction(this.cursorX, this.cursorY, position)
        );
      }
    } else {
      resetActiveElement();
      setCurrentAction(createMovingCanvasAction(this.cursorX, this.cursorY));
    }

    this.startUpdating();
  };

  handleMouseMove = (event: MouseEvent) => {
    if (isActionSet(getCurrentAction())) {
      this.setCursorPosition(event.offsetX, event.offsetY);
    }

    this.updateCursor(...this.getLogicalPosition(event.offsetX, event.offsetY));
  };

  handleMouseUp = () => {
    this.stopUpdating();

    console.log("mouse up");

    if (isSelectedElementAction(getCurrentAction())) {
      this.deselectElement();
    }

    if (isDraggingAction(getCurrentAction())) {
      this.finishDragging();
      this.selectElement(getActiveElementIndex());
    }

    if (isResizingAction(getCurrentAction())) {
      this.finishResizing();
      this.selectElement(getActiveElementIndex());
    }

    if (isMovingCanvasAction(getCurrentAction())) {
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

    if (!isSelectedElementAction(getCurrentAction())) {
      return;
    }

    if (event.key === "Escape") {
      this.deselectElement();
      this.update();
      return;
    }

    const timeoutId = setTimeout(() => {
      const activeElement = getActiveElement();

      if (isText(activeElement)) {
        // @ts-expect-error a type issue with value
        activeElement.setLabel(event.target.value);

        this.update();
      }

      clearTimeout(timeoutId);
    }, 0);
  };

  // TODO: May be a separate function
  checkColisionsAtXY = (x: number, y: number) => {
    const elements = getElements();
    for (let i = 0; i < elements.length; i++) {
      const outerBox = expandBox(
        elements[i].innerBox,
        OUTER_BOX_OFFSET / this.zoom
      );

      if (isPointInBox(x, y, outerBox)) return i;
    }

    return -1;
  };

  updateCursor = (x: number, y: number) => {
    if (
      isDraggingAction(getCurrentAction()) ||
      isResizingAction(getCurrentAction())
    ) {
      return;
    }

    if (isMovingCanvasAction(getCurrentAction())) {
      setDocumentCursor("all-scroll");
      return;
    }

    const elementI = this.checkColisionsAtXY(x, y);

    if (elementI < 0) {
      setDocumentCursor();
      return;
    }

    if (!isActionSet(getCurrentAction())) {
      setDocumentCursor("grab");
    }

    if (isSelectedElementAction(getCurrentAction())) {
      const innerBox = getElements()[elementI].innerBox;
      const position = getElementBoxPosition(x, y, innerBox);
      setDocumentCursor(getCursorForElementBoxPosition(position));
    }
  };

  startDragging = () => {
    setCurrentAction(createDraggingAction(this.cursorX, this.cursorY));
    setDocumentCursor("grabbing");
  };

  finishDragging = () => {
    const currentAction = getCurrentAction();
    if (!isDraggingAction(currentAction)) return;

    const dx = this.cursorX - currentAction[1].startX;
    const dy = this.cursorY - currentAction[1].startY;

    const activeElement = getActiveElement();

    activeElement.setProps(activeElement.x + dx, activeElement.y + dy);
  };

  finishResizing = () => {
    const currentAction = getCurrentAction();

    if (!isResizingAction(currentAction)) return;

    const activeElement = getActiveElement();

    activeElement.setProps(
      ...calculateResizedElementPosition(
        activeElement,
        currentAction[1].direction,
        this.cursorX,
        this.cursorY,
        currentAction[1].startX,
        currentAction[1].startY
      )
    );

    resetCurrentAction();
  };

  finishMovingCanvas = () => {
    const currentAction = getCurrentAction();

    if (!isMovingCanvasAction(currentAction)) return;

    const dx = this.cursorX - currentAction[1].startX;
    const dy = this.cursorY - currentAction[1].startY;

    this.updateViewport(undefined, dx, dy);
    resetCurrentAction();
  };

  selectElement = (i: number) => {
    setActiveElementIndex(i);
    setCurrentAction(createSelectedElementAction());

    const activeElement = getActiveElement();

    if (isText(activeElement)) {
      const input = document.getElementById("edit-text") as HTMLInputElement;

      if (!input) return;
      // @ts-expect-error a type issue with handleKeyDown
      input.addEventListener("keydown", this.handleKeyDown);

      input.value = activeElement.label;
      input.focus();
    }
  };

  deselectElement = () => {
    resetCurrentAction();
    resetActiveElement();

    const input = document.getElementById("edit-text") as HTMLInputElement;

    if (input) {
      input.value = "";

      // @ts-expect-error a type issue with handleKeyDown
      input.removeEventListener("keydown", this.handleKeyDown);
    }
  };

  addText = (label?: string, color?: string, x?: number, y?: number) => {
    const text = new Text(label, color, x, y);
    addElement(text);

    this.selectElement(getElements().length - 1);

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

    const currentAction = getCurrentAction();
    const activeElementI = getActiveElementIndex();

    let frameOffsetX = this.viewportOffsetX;
    let frameOffsetY = this.viewportOffsetY;

    if (isMovingCanvasAction(currentAction)) {
      frameOffsetX -= this.cursorX - currentAction[1].startX;
      frameOffsetY -= this.cursorY - currentAction[1].startY;
    }

    this.canvas.prepareFrame(this.zoom, -frameOffsetX, -frameOffsetY);

    ////// DRAW STATIC ELEMENTS //////

    const staticElements = getStaticElements();

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

    if (activeElementI < 0) {
      return;
    }

    const activeElement = getActiveElement();

    if (isDraggingAction(currentAction)) {
      const dx = activeElement.x + this.cursorX - currentAction[1].startX;
      const dy = activeElement.y + this.cursorY - currentAction[1].startY;

      this.canvas.drawElement(activeElement, dx, dy);
    }

    if (isSelectedElementAction(getCurrentAction())) {
      this.canvas.drawElement(activeElement);

      this.canvas.restoreTransform();

      const transformedBox = transformBox(
        activeElement.innerBox,
        this.getPhysicalPosition
      );
      const selectionBox = expandBox(transformedBox, OUTER_BOX_OFFSET);
      this.canvas.drawSelectionBox(selectionBox);
    }

    if (isResizingAction(currentAction)) {
      const { startX, startY, direction } = currentAction[1];

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
