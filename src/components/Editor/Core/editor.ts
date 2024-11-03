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
  ZOOM_SENSITIVITY,
} from "./consts";
import { Canvas } from "./canvas";
import { EditorAction, EditorActionType, Position } from "./types";
import {
  createDraggingAction,
  createMovingCanvasAction,
  createResizingAction,
  createSelectedElementAction,
  createZoomingAction,
  isActionSet,
  isDraggingAction,
  isMovingCanvasAction,
  isResizingAction,
  isSelectedElementAction,
  isZoomingAction,
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

  touch1X = 0;
  touch1Y = 0;
  touch2X = 0;
  touch2Y = 0;

  physicalTouch1X = 0;
  physicalTouch1Y = 0;
  physicalTouch2X = 0;
  physicalTouch2Y = 0;

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
      onMouseDown: this.onMouseDown,
      onMouseMove: this.onMouseMove,
      onMouseUp: this.onMouseUp,
      onWheel: this.handleWheel,
      onTouchStart: this.handleTouchStart,
      onTouchMove: this.handleTouchMove,
      onTouchEnd: this.handleTouchEnd,
    });

    const label = "Random";
    const x = 10;
    const y = 200;

    const text = new Text(label, "red", x, y);

    addElement(text);

    // Initial elements
    this.addText();

    $renderingKey.listen(() => {
      this.update();
    });
  };

  calculateNewViewport = (
    zoom?: number,
    dx?: number,
    dy?: number,
    focusX?: number,
    focusY?: number
  ) => {
    // Deliberately assuming that zoom is not provided in such a case
    if (dx != null && dy != null) {
      return [this.zoom, this.viewportOffsetX - dx, this.viewportOffsetY - dy];
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

    // console.log("getViewport", { zoom, focusX, newW, newOffsetX });

    return [zoom, newOffsetX, newOffsetY];
  };

  setViewport = (zoom: number, newOffsetX: number, newOffsetY: number) => {
    this.zoom = zoom;
    this.viewportOffsetX = newOffsetX;
    this.viewportOffsetY = newOffsetY;
  }

  updateViewport = (
    ...args: Parameters<typeof this.calculateNewViewport>
  ) => {
    const newViewport = this.calculateNewViewport(...args);
    this.setViewport(newViewport[0], newViewport[1], newViewport[2]);
  }

  calculatePinchZoom = (startTouchPoints: Position[], currentTouchPoints: Position[]) => {
    console.log('calculatePinchZoom', { startTouchPoints, currentTouchPoints })
    const [startPoint1, startPoint2] = startTouchPoints;
    const [currentPoint1, currentPoint2] = currentTouchPoints;

    const initialDist = Math.hypot(startPoint1[0] - startPoint2[0], startPoint1[1] - startPoint2[1]);
    const currDist = Math.hypot(currentPoint1[0] - currentPoint2[0], currentPoint1[1] - currentPoint2[1]);
    const dist = currDist - initialDist;

    const newZoom = this.zoom * Math.pow(2, dist / ZOOM_SENSITIVITY);

    const focusX = (startPoint1[0] + startPoint2[0]) / 2;
    const focusY = (startPoint1[1] + startPoint2[1]) / 2;

    console.log('calc Zoom', { oldZoom: this.zoom, newZoom, dist });

    const [zoom, frameOffsetX, frameOffsetY] = this.calculateNewViewport(
      newZoom,
      undefined,
      undefined,
      focusX,
      focusY
    );

    return [zoom, frameOffsetX, frameOffsetY];
  }

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

  setTouchPosition = (x1?: number, y1?: number, x2?: number, y2?: number) => {
    console.log('set touch pos', x1, y1, x2, y2);

    if (x1 == null || y1 == null) {
      this.physicalTouch1X = -1;
      this.physicalTouch1Y = -1;
      this.touch1X = -1;
      this.touch1Y = -1;
    } else {
      this.physicalTouch1X = x1;
      this.physicalTouch1Y = y1;

      const canvasPosition1 = this.getLogicalPosition(x1, y1);
      this.touch1X = canvasPosition1[0];
      this.touch1Y = canvasPosition1[1];
    }

    if (x2 == null || y2 == null) {
      this.physicalTouch2X = -1;
      this.physicalTouch2Y = -1;
      this.touch2X = -1;
      this.touch2Y = -1;
    } else {
      this.physicalTouch2X = x2;
      this.physicalTouch2Y = y2;

      const canvasPosition2 = this.getLogicalPosition(x2, y2);
      this.touch2X = canvasPosition2[0];
      this.touch2Y = canvasPosition2[1];
    }
  };

  handleZoomInClick = () => {
    this.updateViewport(this.zoom * 2);
    this.update();
  };

  handleZoomOutClick = () => {
    this.updateViewport(this.zoom / 2);
    this.update();
  };

  onMouseDown = (event: MouseEvent) => {
    this.handleEventDown(event.offsetX, event.offsetY);
  };

  // TODO: Replace all arrow functions with regular functions?
  handleEventDown = (...args: number[]) => {
    console.log('handleEventDown', { args });

    if (args[0] == null || args[1] == null) return;

    this.setTouchPosition(...args);

    if (args[2] == null && args[3] == null) {
      const elementI = this.checkColisionsAtXY(this.touch1X, this.touch1Y);

      if (elementI > -1) {
        setActiveElementIndex(elementI);

        const activeElement = getActiveElement();

        const position = getElementBoxPosition(
          this.touch1X,
          this.touch1Y,
          activeElement.innerBox
        );

        if (position === ElementBoxPosition.InnerBox) {
          this.startDragging();
        } else if (isSelectedElementAction(getCurrentAction())) {
          setCurrentAction(
            createResizingAction(this.touch1X, this.touch1Y, position)
          );
        }
      } else {
        resetActiveElement();
        // TODO: This should be overwritten. It should not be assumed that if there is no activeElement, then it's "movingCanvas" action
        setCurrentAction(createMovingCanvasAction(this.touch1X, this.touch1Y));
      }
    }

    this.startUpdating();
  }

  onMouseMove = (event: MouseEvent) => {
    this.handleEventMove(event.offsetX, event.offsetY);
  };

  handleEventMove = (...args: number[]) => {
    const currentAction = getCurrentAction();
    console.log('debug handleEventMove', [...args]);

    if (isActionSet(getCurrentAction())) {
      this.setTouchPosition(...args);
    }

    if (args[0] != null && args[1] != null && args[2] != null && args[3] != null) {
      if (!isZoomingAction(currentAction)) {
        this.setTouchPosition(...args);
        this.setAction(createZoomingAction([[this.physicalTouch1X, this.physicalTouch1Y], [this.physicalTouch2X, this.physicalTouch2Y]]));
      }
    }

    this.updateCursor(args[0], args[1]);
  }

  onMouseUp = () => {
    this.handleEventUp();
  }

  handleEventUp = () => {
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

    if (isZoomingAction(getCurrentAction())) {
      this.finishZooming();
    }

    this.setTouchPosition();

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

  handleTouchStart = (event: TouchEvent) => {
    console.log("touch start", { touches: event.touches });

    event.preventDefault();

    this.handleEventDown(
      event.touches[0]?.clientX,
      event.touches[0]?.clientY,
      event.touches[1]?.clientX,
      event.touches[1]?.clientY
    );
  };

  handleTouchMove = (event: TouchEvent) => {
    console.log("touch move", { touhces: event.touches });

    event.preventDefault();

    this.handleEventMove(
      event.touches[0]?.clientX,
      event.touches[0]?.clientY,
      event.touches[1]?.clientX,
      event.touches[1]?.clientY
    );
  };

  handleTouchEnd = (event: TouchEvent) => {
    console.log("touch end", { touches: event.touches });

    event.preventDefault();

    this.handleEventUp();
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

  // This method (and everything related to actions) should not be in editor
  // Rename to "switch" action
  setAction = (action?: EditorAction) => {
    const currentAction = getCurrentAction();
    switch (currentAction[0]) {
      case EditorActionType.Dragging:
        this.finishDragging();
        this.deselectElement();
        break;
      case EditorActionType.MovingCanvas:
        this.finishMovingCanvas();
        break;
      case EditorActionType.SelectedElement:
        this.deselectElement();
        break;
    }

    if (action) {
      setCurrentAction(action);
    }
  }

  startDragging = () => {
    setCurrentAction(createDraggingAction(this.touch1X, this.touch1Y));
    setDocumentCursor("grabbing");
  };

  finishDragging = () => {
    const currentAction = getCurrentAction();
    if (!isDraggingAction(currentAction)) return;

    const dx = this.touch1X - currentAction[1].startX;
    const dy = this.touch1Y - currentAction[1].startY;

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
        this.touch1X,
        this.touch1Y,
        currentAction[1].startX,
        currentAction[1].startY
      )
    );

    resetCurrentAction();
  };

  finishMovingCanvas = () => {
    const currentAction = getCurrentAction();

    if (!isMovingCanvasAction(currentAction)) return;

    const dx = this.touch1X - currentAction[1].startX;
    const dy = this.touch1Y - currentAction[1].startY;

    this.updateViewport(undefined, dx, dy);
    resetCurrentAction();
  };

  finishZooming = () => {
    const currentAction = getCurrentAction();

    if (!isZoomingAction(currentAction)) return;

    const newViewport = this.calculatePinchZoom(
      currentAction[1],
      [[this.physicalTouch1X, this.physicalTouch1Y], [this.physicalTouch2X, this.physicalTouch2Y]],
    );

    console.log('debug finishZooming', { newViewport });

    this.setViewport(newViewport[0], newViewport[1], newViewport[2]);
    resetCurrentAction();
  }

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
      // input.focus();
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
    console.log("do update", this.touch1X);

    ////// PREPARE FRAME //////

    const currentAction = getCurrentAction();
    const activeElementI = getActiveElementIndex();

    console.log('currentAction', currentAction[0]);

    let frameOffsetX = this.viewportOffsetX;
    let frameOffsetY = this.viewportOffsetY;
    let zoom = this.zoom;

    if (isMovingCanvasAction(currentAction)) {
      frameOffsetX -= this.touch1X - currentAction[1].startX;
      frameOffsetY -= this.touch1Y - currentAction[1].startY;
    }

    if (isZoomingAction(currentAction)) {
      [zoom, frameOffsetX, frameOffsetY] = this.calculatePinchZoom(
        currentAction[1],
        [[this.physicalTouch1X, this.physicalTouch1Y], [this.physicalTouch2X, this.physicalTouch2Y]],
      );
    }

    this.canvas.prepareFrame(zoom, -frameOffsetX, -frameOffsetY);

    ////// DRAW STATIC ELEMENTS //////

    const staticElements = getStaticElements();

    const nextElementsHash = getRenderingHash(
      staticElements,
      zoom,
      -frameOffsetX,
      -frameOffsetY
    );

    if (nextElementsHash !== this.elementsHash) {
      this.elementsHash = nextElementsHash;

      this.canvas.prepareStaticFrame(zoom, -frameOffsetX, -frameOffsetY);

      for (let i = 0; i < staticElements.length; i++) {
        this.canvas.drawElement(staticElements[i]);
      }

      this.canvas.finishStaticFrame();
    }

    this.canvas.drawStaticFrame(zoom, -frameOffsetX, -frameOffsetY);

    ////// DRAW ACTIVE ELEMENT //////

    if (activeElementI < 0) {
      return;
    }

    const activeElement = getActiveElement();

    if (isDraggingAction(currentAction)) {
      const dx = activeElement.x + this.touch1X - currentAction[1].startX;
      const dy = activeElement.y + this.touch1Y - currentAction[1].startY;

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
        this.touch1X,
        this.touch1Y,
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
