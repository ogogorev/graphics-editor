export function intializeControls(handlers) {
  const addTextButton = document.getElementById("add-text");

  addTextButton.addEventListener("click", handlers.onAddText);
}
