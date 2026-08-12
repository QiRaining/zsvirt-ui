import { useSize } from "ahooks";
import { useEffect, useState } from "react";

export const useResponsiveDecoration = (breakpoint = 1280) => {
  const { width = 1920 } = useSize(document.body);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(width > breakpoint);
  }, [width, breakpoint]);

  return isVisible;
};
