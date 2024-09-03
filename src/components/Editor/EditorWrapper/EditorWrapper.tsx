import { useEffect, useRef } from "react";

import { Canvas } from "../everything/canvas";
import { Editor } from "../everything/editor";

export const EditorWrapper = () => {
  return <EditorC />;
};

export const EditorC = () => {
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
      <canvas id="canvas"></canvas>
      <input id="edit-text" />
    </div>
  );
};
