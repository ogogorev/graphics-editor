import { KeyboardEvent } from "react";

import { Text, isText } from "./elements/Text";
import { loadFonts } from "./fonts/fonts";
import { intializeControls } from "./controls";
import {
  getCursorForElementBoxPosition,
  setDocumentCursor,
  getRenderingHash,
} from "./utils";
import {
  getElementBoxPosition,
  calculateResizedElementPosition,
  enlargeBoxByOffset,
  getTranslatedInnerBox,
  isPointInBox,
  transformBox,
} from "./math";
import { ElementBoxPosition, OUTER_BOX_OFFSET } from "./consts";
import { Canvas } from "./canvas";
import { EditorAction, EditorActionType } from "./types";
import {
  createDraggingAction,
  createMovingCanvasAction,
  createResizingAction,
  createSelectedElementAction,
  createZoomingAction,
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
  getElement,
} from "./state";
import {
  calculatePinchZoom,
  getPhysicalPosition,
  renderingState,
  setTouchPoints,
  setViewport,
  updateViewport,
} from "./renderingState";

export class Editor {
  canvas: Canvas;

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
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
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

  handleZoomInClick = () => {
    updateViewport(renderingState.zoom * 2);
    this.update();
  };

  handleZoomOutClick = () => {
    updateViewport(renderingState.zoom / 2);
    this.update();
  };

  onMouseDown = (event: MouseEvent) => {
    this.handleDown(event.offsetX, event.offsetY);
  };

  onMouseMove = (event: MouseEvent) => {
    this.handleMove(event.offsetX, event.offsetY);
  };

  onMouseUp = () => {
    this.handleUp();
  };

  onTouchStart = (event: TouchEvent) => {
    console.log("touch start", { touches: event.touches });

    event.preventDefault();
    this.handleDown(
      event.touches[0]?.clientX,
      event.touches[0]?.clientY,
      event.touches[1]?.clientX,
      event.touches[1]?.clientY
    );
  };

  onTouchMove = (event: TouchEvent) => {
    console.log("touch move", { touhces: event.touches });

    event.preventDefault();
    this.handleMove(
      event.touches[0]?.clientX,
      event.touches[0]?.clientY,
      event.touches[1]?.clientX,
      event.touches[1]?.clientY
    );
  };

  onTouchEnd = (event: TouchEvent) => {
    console.log("touch end", { touches: event.touches });

    event.preventDefault();
    this.handleUp();
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

  // TODO: Using args is not very readable
  handleDown = (...args: number[]) => {
    console.log("handleDown", { args });

    if (args[0] == null || args[1] == null) return;

    setTouchPoints(...args);

    if (args[2] != null || args[3] != null) return;

    const hoveredElementI = this.checkColisionsAtXY(
      renderingState.touch1X,
      renderingState.touch1Y
    );

    if (hoveredElementI < 0) {
      resetActiveElement();
      setCurrentAction(
        createMovingCanvasAction(renderingState.touch1X, renderingState.touch1Y)
      );
    }

    if (hoveredElementI > -1 && hoveredElementI === getActiveElementIndex()) {
      const activeElement = getActiveElement();

      const position = getElementBoxPosition(
        renderingState.touch1X,
        renderingState.touch1Y,
        activeElement.innerBox
      );

      switch (position) {
        case ElementBoxPosition.InnerBox:
          this.startDragging();
          break;
        default:
          setCurrentAction(
            createResizingAction(
              renderingState.touch1X,
              renderingState.touch1Y,
              position
            )
          );
      }
    }

    if (hoveredElementI > -1 && hoveredElementI !== getActiveElementIndex()) {
      setActiveElementIndex(hoveredElementI);
      this.startDragging();
    }

    this.startUpdating();
  };

  handleMove = (...args: number[]) => {
    // console.log('debug handleMove', [...args]);

    setTouchPoints(...args);

    const currentAction = getCurrentAction();
    if (
      args[0] != null &&
      args[1] != null &&
      args[2] != null &&
      args[3] != null &&
      !isZoomingAction(currentAction)
    ) {
      this.setAction(
        createZoomingAction([
          [renderingState.physicalTouch1X, renderingState.physicalTouch1Y],
          [renderingState.physicalTouch2X, renderingState.physicalTouch2Y],
        ])
      );
    }

    this.updateCursor(renderingState.touch1X, renderingState.touch1Y);
  };

  handleUp = () => {
    console.log("mouse up");

    this.stopUpdating();

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

    setTouchPoints();

    this.update();
  };

  handleWheel = (event: WheelEvent) => {
    console.log("wheel", event);

    updateViewport(
      renderingState.zoom - event.deltaY * 0.01,
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

  // TODO: May be a separate function
  checkColisionsAtXY = (x: number, y: number) => {
    const elements = getElements();
    for (let i = 0; i < elements.length; i++) {
      const outerBox = enlargeBoxByOffset(
        elements[i].innerBox,
        OUTER_BOX_OFFSET / renderingState.zoom
      );

      if (isPointInBox([x, y], outerBox)) return i;
    }

    return -1;
  };

  updateCursor = (x: number, y: number) => {
    switch (getCurrentAction()[0]) {
      case EditorActionType.Dragging:
      case EditorActionType.Resizing:
      case EditorActionType.Zooming:
        return;
      case EditorActionType.MovingCanvas:
        setDocumentCursor("all-scroll");
        return;
      case EditorActionType.SelectedElement:
      default: {
        const hoveredElementI = this.checkColisionsAtXY(x, y);

        if (hoveredElementI < 0) {
          setDocumentCursor();
          return;
        }

        if (hoveredElementI === getActiveElementIndex()) {
          const innerBox = getElement(hoveredElementI).innerBox;
          const position = getElementBoxPosition(x, y, innerBox);
          setDocumentCursor(getCursorForElementBoxPosition(position));
        } else {
          setDocumentCursor("grab");
        }
      }
    }
  };

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
  };

  startDragging = () => {
    setCurrentAction(
      createDraggingAction(renderingState.touch1X, renderingState.touch1Y)
    );
    setDocumentCursor("grabbing");
  };

  finishDragging = () => {
    const currentAction = getCurrentAction();
    if (!isDraggingAction(currentAction)) return;

    const dx = renderingState.touch1X - currentAction[1].startX;
    const dy = renderingState.touch1Y - currentAction[1].startY;

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
        renderingState.touch1X,
        renderingState.touch1Y,
        currentAction[1].startX,
        currentAction[1].startY
      )
    );

    resetCurrentAction();
  };

  finishMovingCanvas = () => {
    const currentAction = getCurrentAction();

    if (!isMovingCanvasAction(currentAction)) return;

    const dx = renderingState.touch1X - currentAction[1].startX;
    const dy = renderingState.touch1Y - currentAction[1].startY;

    updateViewport(undefined, dx, dy);
    resetCurrentAction();
  };

  finishZooming = () => {
    const currentAction = getCurrentAction();

    if (!isZoomingAction(currentAction)) return;

    const newViewport = calculatePinchZoom(currentAction[1], [
      [renderingState.physicalTouch1X, renderingState.physicalTouch1Y],
      [renderingState.physicalTouch2X, renderingState.physicalTouch2Y],
    ]);

    console.log("debug finishZooming", { newViewport });

    setViewport(newViewport[0], newViewport[1], newViewport[2]);
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
    // console.log("do update", renderingState.touch1X);

    ////// PREPARE FRAME //////

    const currentAction = getCurrentAction();
    const activeElementI = getActiveElementIndex();

    console.log("currentAction", currentAction);

    let frameOffsetX = renderingState.viewportOffsetX;
    let frameOffsetY = renderingState.viewportOffsetY;
    let zoom = renderingState.zoom;

    if (isMovingCanvasAction(currentAction)) {
      frameOffsetX -= renderingState.touch1X - currentAction[1].startX;
      frameOffsetY -= renderingState.touch1Y - currentAction[1].startY;
    }

    if (isZoomingAction(currentAction)) {
      [zoom, frameOffsetX, frameOffsetY] = calculatePinchZoom(
        currentAction[1],
        [
          [renderingState.physicalTouch1X, renderingState.physicalTouch1Y],
          [renderingState.physicalTouch2X, renderingState.physicalTouch2Y],
        ]
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
      const dx =
        activeElement.x + renderingState.touch1X - currentAction[1].startX;
      const dy =
        activeElement.y + renderingState.touch1Y - currentAction[1].startY;

      this.canvas.drawElement(activeElement, dx, dy);
    }

    if (isSelectedElementAction(getCurrentAction())) {
      this.canvas.drawElement(activeElement);

      this.canvas.restoreTransform();

      const transformedBox = transformBox(
        activeElement.innerBox,
        getPhysicalPosition
      );
      const selectionBox = enlargeBoxByOffset(transformedBox, OUTER_BOX_OFFSET);
      this.canvas.drawSelectionBox(selectionBox);
    }

    if (isResizingAction(currentAction)) {
      const { startX, startY, direction } = currentAction[1];

      const [x, y, scaleX, scaleY] = calculateResizedElementPosition(
        activeElement,
        direction,
        renderingState.touch1X,
        renderingState.touch1Y,
        startX,
        startY
      );

      this.canvas.drawElement(activeElement, x, y, scaleX, scaleY);

      this.canvas.restoreTransform();

      const innerBox = getTranslatedInnerBox(
        x,
        y,
        activeElement.localBox,
        scaleX,
        scaleY
      );
      const transformedBox = transformBox(innerBox, getPhysicalPosition);
      const selectionBox = enlargeBoxByOffset(transformedBox, OUTER_BOX_OFFSET);
      this.canvas.drawSelectionBox(selectionBox);
    }
  };
}
