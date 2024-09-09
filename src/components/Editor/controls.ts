export function intializeControls(handlers: {
  onAddText: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const addTextButton = document.getElementById("add-text");
  addTextButton?.addEventListener("click", handlers.onAddText);

  const zoomInButton = document.getElementById("zoom-in");
  zoomInButton?.addEventListener("click", handlers.onZoomIn);

  const zoomOutButton = document.getElementById("zoom-out");
  zoomOutButton?.addEventListener("click", handlers.onZoomOut);
}
