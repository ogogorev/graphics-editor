import { useEffect, useRef } from "react";

import { Canvas } from "../Core/canvas";
import { Editor } from "../Core/editor";
import { Controls } from "../Controls/Controls";
import { ElementDetails } from "../ElementDetails/ElementDetails";

import "./EditorContainer.css";

export const EditorContainer = () => {
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    if (editorRef.current) return;

    const init = async () => {
      const canvas = new Canvas("canvas");

      const editor = new Editor(canvas);
      editorRef.current = editor;

      await editor.init();
    };

    init();
  }, []);

  return (
    <div>
      <Controls />
      <ElementDetails />

      <canvas id="canvas"></canvas>
      <input id="edit-text" />

      <p id="debug-container"></p>
    </div>
  );
};
