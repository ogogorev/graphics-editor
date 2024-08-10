export class MouseEvents {
  mousePositionX;
  mousePositionY;

  constructor(node) {
    this.node = node;

    this.addEventListeners();
  }

  addListeners = () => {
    this.node.addEventListener("mousedown", (event) => {
      this.mousePositionX = event.offsetX;
      this.mousePositionY = event.offsetY;
    });

    this.node.addEventListener("mousemove", (event) => {
      if (mousePositionX) {
        this.mousePositionX = event.offsetX;
        this.mousePositionY = event.offsetY;
      }
    });

    this.node.addEventListener("mouseup", (event) => {
      this.mousePositionX = undefined;
      this.mousePositionY = undefined;
    });
  };
}
