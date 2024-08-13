export const getCursorForElementBox = (x, y, innerBox) => {
  if (
    x > innerBox.x1 &&
    x < innerBox.x2 &&
    y > innerBox.y1 &&
    y < innerBox.y2
  ) {
    return "grab";
  }

  // top-left or bottom-right control points
  if (
    (x <= innerBox.x1 && y <= innerBox.y1) ||
    (x >= innerBox.x2 && y >= innerBox.y2)
  ) {
    return "nwse-resize";
  }

  // top-right or bottom-left control points
  if (
    (x <= innerBox.x1 && y >= innerBox.y2) ||
    (x >= innerBox.x2 && y <= innerBox.y1)
  ) {
    return "nesw-resize";
  }

  // left or right border
  if (x <= innerBox.x1 || x >= innerBox.x2) {
    return "ew-resize";
  }

  // top or bottom border
  if (y <= innerBox.y1 || y >= innerBox.y2) {
    return "ns-resize";
  }
};

export const setDocumentCursor = (cursor) => {
  document.body.style.cursor = cursor;
};
