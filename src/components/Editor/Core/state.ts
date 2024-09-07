import { atom } from "nanostores";

import { EditorAction, Element } from "./types";

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

export const getActiveElement = () => {
  return getElements()[getActiveElementIndex()];
};

export const resetActiveElement = () => {
  setActiveElementIndex(-1);
};