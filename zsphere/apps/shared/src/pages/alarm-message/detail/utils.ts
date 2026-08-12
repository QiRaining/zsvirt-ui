import type { useRef } from "react";

export const copyDom = (ref: ReturnType<typeof useRef>) => {
  if (typeof (window as any).InstallTrigger !== "undefined") {
    // firefox
    const range = document.createRange();
    range.selectNode(ref.current as unknown as HTMLDivElement);
    window.getSelection()?.addRange(range);
    document.execCommand("copy");
    window.getSelection()?.removeAllRanges();
  } else {
    // chrome 需要点两次才能复制的bug。
    Promise.resolve().then(() => {
      const range = document.createRange();
      range.selectNode(ref.current as unknown as HTMLDivElement);
      window.getSelection()?.removeAllRanges();
      Promise.resolve().then(() => {
        range.selectNode(ref.current as unknown as HTMLDivElement);
        window.getSelection()?.addRange(range);
        document.execCommand("copy");
        window.getSelection()?.removeAllRanges();
      });
    });
  }
};
