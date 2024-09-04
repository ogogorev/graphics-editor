import { useEffect, useRef } from "react";

// @ts-expect-error missing declaration
import { Canvas } from "./canvas";
// @ts-expect-error missing declaration
import { Editor } from "./editor";
import { Controls } from "./Controls/Controls";

import "./EditorContainer.css";

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
