export function intializeControls(callbacks) {
  const addTextButton = document.getElementById("add-text");

  addTextButton.addEventListener("click", callbacks.onAddText);
}
