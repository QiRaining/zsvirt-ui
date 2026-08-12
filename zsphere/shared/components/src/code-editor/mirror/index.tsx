import { EditorView } from "@codemirror/view";
import { showMinimap } from "@replit/codemirror-minimap";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import cls from "classnames";
import React, { useMemo, useRef, useEffect } from "react";

import style from "./style.module.less";

export interface IProps {
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  border?: boolean;
  height?: string | number;
  width?: string | number;
  minimap?: boolean;
  title?: React.ReactNode;
  showFullscreen?: boolean;
  check?: () => void;
  options?: Record<string, unknown>;
  id?: string;
}

export default function CodeMirrorEditor({
  className,
  value,
  onChange,
  readonly,
  border,
  height,
  width,
  minimap,
}: IProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    const antModal = wrapperRef.current?.closest(".ant-modal") as HTMLElement;
    if (antModal) {
      antModal.addEventListener(
        "animationend",
        () => {
          editorRef.current?.view?.requestMeasure();
          setTimeout(() => {
            editorRef.current?.view?.scrollDOM.scrollTo({ top: 0 });
          });
        },
        { once: true },
      );
    }
  }, []);

  const theme = useMemo(
    () =>
      EditorView.theme({
        ".cm-gutters": {
          backgroundColor: "white",
        },
        ".cm-lineNumbers .cm-gutterElement": {
          userSelect: "none",
          paddingLeft: "16px",
        },
        ".cm-selectionMatch": {
          backgroundColor: "#d6d6d680",
        },
        ...(readonly && {
          ".cm-activeLine": {
            backgroundColor: "transparent",
          },
          ".cm-activeLineGutter": {
            backgroundColor: "transparent",
          },
        }),
      }),
    [readonly],
  );

  const extensions = useMemo(() => {
    const result: any[] = [];
    if (readonly) {
      result.push(EditorView.editable.of(false));
    }
    if (minimap) {
      result.push(
        showMinimap.of({
          create: () => ({ dom: document.createElement("div") }),
        }),
      );
    }
    return result;
  }, [readonly, minimap]);

  const heightStr = typeof height === "number" ? `${height}px` : height;
  const widthStr = typeof width === "number" ? `${width}px` : width;

  return (
    <div
      ref={wrapperRef}
      className={cls(className, style.wrapper, { [style.border]: border })}
      style={{ width: widthStr }}
    >
      {/* @ts-ignore */}
      <CodeMirror
        ref={editorRef}
        theme={theme}
        height={heightStr}
        value={value}
        onChange={onChange}
        readOnly={readonly}
        extensions={extensions}
      />
    </div>
  );
}
