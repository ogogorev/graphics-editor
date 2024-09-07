import { atom } from "nanostores";

import { EditorAction } from "./types";

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
