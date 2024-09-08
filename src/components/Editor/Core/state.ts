import { atom, computed } from "nanostores";

import { EditorAction, Element } from "./types";

//////// RENDERING STATE ////////

export const $renderingKey = atom<number>(1);
export const updateRenderingKey = () => {
  $renderingKey.set(($renderingKey.get() + 1) % 10);
};

export const scheduleUpdate = (cb: () => void) => {
  cb();
  updateRenderingKey();
};

//////// ACTION ////////

export const $currentAction = atom<EditorAction | []>([]);

export const getCurrentAction = () => {
  return $currentAction.get();
};

export const setCurrentAction = (action: EditorAction) => {
  $currentAction.set(action);
};

export const resetCurrentAction = () => {
  $currentAction.set([]);
};

//////// ELEMENTS ////////

export const $elements = atom<Element[]>([]);

export const getElements = () => {
  return $elements.get();
};

export const addElement = (element: Element) => {
  $elements.set([...$elements.get(), element]);
};

// TODO: Use computed here
export const getStaticElements = () => {
  const activeElementI = getActiveElementIndex();
  return getElements().filter((_, i) => i !== activeElementI);
};

//////// ACTIVE ELEMENT ////////

export const $activeElementI = atom<number>(-1);

export const getActiveElementIndex = () => {
  return $activeElementI.get();
};

export const setActiveElementIndex = (index: number) => {
  $activeElementI.set(index);
};

export const resetActiveElement = () => {
  setActiveElementIndex(-1);
};

export const $activeElement = computed($activeElementI, (activeElementI) => {
  return getElements()[activeElementI];
});

export const getActiveElement = () => {
  return $activeElement.get();
};

$activeElementI.subscribe((v) => console.log("active element Index", v));
$activeElement.subscribe((v) => console.log("active element", v));
