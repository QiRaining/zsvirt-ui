import type { Layout } from "react-grid-layout";

/**
 * @param pinToTopId - widget id to pin at the top in sm/xs/xxs breakpoints (e.g. welcome card)
 */
export function genResponsiveLayouts(
  lgLayouts: Layout[],
  pinToTopId?: string,
): {
  lg: Layout[];
  md: Layout[];
  sm: Layout[];
  xs: Layout[];
  xxs: Layout[];
} {
  const sorted = [...lgLayouts].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x,
  );

  const reorder = (items: Layout[]): Layout[] => {
    if (!pinToTopId) {
      return items;
    }
    const pinned = items.find((i) => i.i === pinToTopId);
    if (!pinned) {
      return items;
    }
    return [pinned, ...items.filter((i) => i.i !== pinToTopId)];
  };

  const md: Layout[] = [];
  const sm: Layout[] = [];
  const xs: Layout[] = [];
  const xxs: Layout[] = [];

  // md: 4 cols
  // If pinToTopId: first non-pinned widget left (w:2,x:0), pinned right (w:2,x:2), row 0.
  // Remaining widgets pair up in 2+2 rows.
  {
    const pinned = pinToTopId ? sorted.find((i) => i.i === pinToTopId) : null;
    const rest = pinned ? sorted.filter((i) => i.i !== pinToTopId) : sorted;

    if (pinned && rest.length > 0) {
      const firstH = Math.max(rest[0].h, pinned.h);
      md.push({ ...rest[0], w: 2, h: firstH, x: 0, y: 0 });
      md.push({ ...pinned, w: 2, h: firstH, x: 2, y: 0 });
      let curX = 0;
      let curY = firstH;
      for (const item of rest.slice(1)) {
        const w = Math.min(item.w, 4);
        if (curX + w > 4) {
          curX = 0;
          curY += item.h;
        }
        md.push({ ...item, w, h: item.h, x: curX, y: curY });
        curX += w;
        if (curX >= 4) {
          curX = 0;
          curY += item.h;
        }
      }
    } else {
      // no pin: greedy fill
      let curX = 0;
      let curY = 0;
      for (const item of sorted) {
        const w = Math.min(item.w, 4);
        if (curX + w > 4) {
          curX = 0;
          curY += item.h;
        }
        md.push({ ...item, w, h: item.h, x: curX, y: curY });
        curX += w;
        if (curX >= 4) {
          curX = 0;
          curY += item.h;
        }
      }
    }
  }

  // sm: 2 cols
  // If pinToTopId exists: first widget goes left (x:0,w:1), welcome card goes right (x:1,w:1),
  // remaining widgets stack full-width (w:2) from row 1 onwards.
  {
    const pinned = pinToTopId ? sorted.find((i) => i.i === pinToTopId) : null;
    const rest = pinned ? sorted.filter((i) => i.i !== pinToTopId) : sorted;

    if (pinned && rest.length > 0) {
      const firstH = Math.max(rest[0].h, pinned.h);
      // first widget: left col
      sm.push({ ...rest[0], w: 1, h: firstH, x: 0, y: 0 });
      // welcome card: right col, same row
      sm.push({ ...pinned, w: 1, h: firstH, x: 1, y: 0 });
      // rest: full-width, stacked
      let curY = firstH;
      for (const item of rest.slice(1)) {
        sm.push({ ...item, w: 2, h: item.h, x: 0, y: curY });
        curY += item.h;
      }
    } else {
      // no pin: all full-width
      let curY = 0;
      for (const item of sorted) {
        sm.push({ ...item, w: 2, h: item.h, x: 0, y: curY });
        curY += item.h;
      }
    }
  }

  // xs: same 2-col logic as sm (768-1023px container)
  {
    const pinned = pinToTopId ? sorted.find((i) => i.i === pinToTopId) : null;
    const rest = pinned ? sorted.filter((i) => i.i !== pinToTopId) : sorted;

    if (pinned && rest.length > 0) {
      const firstH = Math.max(rest[0].h, pinned.h);
      xs.push({ ...rest[0], w: 1, h: firstH, x: 0, y: 0 });
      xs.push({ ...pinned, w: 1, h: firstH, x: 1, y: 0 });
      let curY = firstH;
      for (const item of rest.slice(1)) {
        xs.push({ ...item, w: 2, h: item.h, x: 0, y: curY });
        curY += item.h;
      }
    } else {
      let curY = 0;
      for (const item of sorted) {
        xs.push({ ...item, w: 2, h: item.h, x: 0, y: curY });
        curY += item.h;
      }
    }
  }

  // xxs: 1 col, welcome card pinned to top
  {
    let curY = 0;
    for (const item of reorder(sorted)) {
      xxs.push({ ...item, w: 1, h: item.h, x: 0, y: curY });
      curY += item.h;
    }
  }

  return { lg: lgLayouts, md, sm, xs, xxs };
}
