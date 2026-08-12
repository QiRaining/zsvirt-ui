import { useState, useEffect, useRef } from "react";

/**
 * Hook to observe container width via ResizeObserver.
 * Returns a ref to attach to the container and the current width.
 */
export function useContainerWidth(): {
  containerRef: React.RefObject<HTMLDivElement>;
  width: number;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    // Set initial width
    setWidth(element.clientWidth);

    const observer = new ResizeObserver((entries) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
        }
      });
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return { containerRef, width };
}
