import { useEffect, useRef } from "react";

import { Canvas } from "./everything/canvas";
import { Editor } from "./everything/editor";
import { Controls } from "./Controls/Controls";

import "./Editor.css";

export const EditorContainer = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const init = async () => {
      initialized.current = true;

      const canvas = new Canvas("canvas");

      const editor = new Editor(canvas);
      await editor.init();
    };

    init();
  }, []);

  return (
    <div>
      <Controls />

      <canvas id="canvas"></canvas>
      <input id="edit-text" />
    </div>
  );
};
