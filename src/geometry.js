import { ELEMENT_BOX_POSITION } from "./consts.js";

export const getVectorByPosition = (position) => {
  switch (position) {
    case ELEMENT_BOX_POSITION.TopLeft:
      return [-1, -1];
    case ELEMENT_BOX_POSITION.BottomRight:
      return [1, 1];
    case ELEMENT_BOX_POSITION.TopRight:
      return [1, -1];
    case ELEMENT_BOX_POSITION.BottomLeft:
      return [-1, 1];
    case ELEMENT_BOX_POSITION.Left:
      return [-1, 0];
    case ELEMENT_BOX_POSITION.Right:
      return [1, 0];
    case ELEMENT_BOX_POSITION.Top:
      return [0, -1];
    case ELEMENT_BOX_POSITION.Bottom:
      return [0, 1];
    case ELEMENT_BOX_POSITION.InnerBox:
    default:
      return [0, 0];
  }
};

// TODO: Rename
export const calculateResizedElementPosition = (
  element,
  direction,
  mouseCurrX,
  mouseCurrY,
  mouseStartX,
  mouseStartY
) => {
  const [kX, kY] = getVectorByPosition(direction);

  const distX = (mouseCurrX - mouseStartX) * kX;
  const distY = (mouseCurrY - mouseStartY) * kY;

  const currW = element.w;
  const currH = element.h;

  const newW = currW + distX;
  const newH = currH + distY;

  const scaleX = newW / currW;
  const scaleY = newH / currH;

  const box = element.innerBox;

  let x = element.x;
  let y = element.y;

  // console.log({ xBefore: x, x1: box.x1 });
  // console.log({ yBefore: y, y1: box.y1, kY, distY, scale: scale[1] });

  const scaleDX = scaleX - 1;
  const innerX = box.x1 - x;

  if (kX > 0) x = x - innerX * scaleDX;
  if (kX < 0) x = x - innerX * scaleDX - currW * scaleDX;

  const scaleDY = scaleY - 1;
  const innerY = box.y1 - y;

  if (kY > 0) y = y - innerY * scaleDY;
  if (kY < 0) y = y - innerY * scaleDY - currH * scaleDY;

  // console.log({ xAfter: x, scaleX, currW, innerX });

  return [x, y, element.scaleX * scaleX, element.scaleY * scaleY];
};

export const getInnerBox = (x, y, localBox, scaleX, scaleY) => {
  return {
    x1: x + localBox.x1 * scaleX,
    y1: y + localBox.y1 * scaleY,
    x2: x + localBox.x2 * scaleX,
    y2: y + localBox.y2 * scaleY,
  };
};

export const getOuterBox = (x, y, localBox, scaleX, scaleY, offset) => {
  const innerBox = getInnerBox(x, y, localBox, scaleX, scaleY);

  return {
    x1: innerBox.x1 - offset,
    y1: innerBox.y1 - offset,
    x2: innerBox.x2 + offset,
    y2: innerBox.y2 + offset,
  };
};
