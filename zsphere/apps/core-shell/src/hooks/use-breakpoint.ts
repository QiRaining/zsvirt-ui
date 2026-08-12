import { useEffect, useState } from "react";

export type Breakpoint = "compact" | "medium" | "standard" | "wide";

// < 1024: compact, 1024-1279: medium, 1280-1599: standard, >= 1600: wide
function getBreakpoint(width: number): Breakpoint {
  if (width < 1024) {
    return "compact";
  }
  if (width < 1280) {
    return "medium";
  }
  if (width < 1600) {
    return "standard";
  }
  return "wide";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(() =>
    getBreakpoint(window.innerWidth),
  );

  useEffect(() => {
    const queries: [MediaQueryList, Breakpoint][] = [
      [window.matchMedia("(max-width: 1023px)"), "compact"],
      [
        window.matchMedia("(min-width: 1024px) and (max-width: 1279px)"),
        "medium",
      ],
      [
        window.matchMedia("(min-width: 1280px) and (max-width: 1599px)"),
        "standard",
      ],
      [window.matchMedia("(min-width: 1600px)"), "wide"],
    ];

    const handler = () => setBp(getBreakpoint(window.innerWidth));

    queries.forEach(([mq]) => mq.addEventListener("change", handler));
    return () =>
      queries.forEach(([mq]) => mq.removeEventListener("change", handler));
  }, []);

  return bp;
}
