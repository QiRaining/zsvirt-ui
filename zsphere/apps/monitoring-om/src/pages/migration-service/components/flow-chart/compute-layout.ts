import {
  NODE_COUNT,
  SVG_PADDING,
  DEFAULT_NODE_W,
  MIN_GAP,
  MAX_GAP,
  MIN_NODE_W,
} from "./constants";
import type { FlowLayout } from "./types";

/**
 * Progressive responsive layout:
 *  1. Large screen  -> default node width + gaps up to MAX_GAP, SVG fills container
 *  2. Medium screen -> gaps shrink down to MIN_GAP first
 *  3. Small screen  -> gaps at MIN_GAP, node width shrinks down to MIN_NODE_W (text truncates with ...)
 *  4. Tiny screen   -> everything at minimum, SVG stays at computed min width
 */
export const computeLayout = (containerWidth: number): FlowLayout => {
  // Phase 1: try with default node width, compute available gap
  const gapSpaceDefault =
    containerWidth - 2 * SVG_PADDING - NODE_COUNT * DEFAULT_NODE_W;
  const rawGapDefault = gapSpaceDefault / (NODE_COUNT - 1);

  if (rawGapDefault >= MIN_GAP) {
    // Plenty of room: use default node width, clamp gap
    const gap = Math.min(MAX_GAP, rawGapDefault);
    const nodeW = DEFAULT_NODE_W;
    const totalW = NODE_COUNT * nodeW + (NODE_COUNT - 1) * gap;
    const svgWidth = Math.max(containerWidth, totalW + 2 * SVG_PADDING);
    const startX = (svgWidth - totalW) / 2;
    return {
      svgWidth,
      nodeW,
      gap,
      startX,
      getNodeX: (index: number) => startX + index * (nodeW + gap),
    };
  }

  // Phase 2: gaps exhausted at default node width -> shrink node width
  const gap = MIN_GAP;
  const availableForNodes =
    containerWidth - 2 * SVG_PADDING - (NODE_COUNT - 1) * gap;
  const rawNodeW = availableForNodes / NODE_COUNT;
  const nodeW = Math.max(MIN_NODE_W, Math.min(DEFAULT_NODE_W, rawNodeW));

  const totalW = NODE_COUNT * nodeW + (NODE_COUNT - 1) * gap;
  const svgWidth = Math.max(containerWidth, totalW + 2 * SVG_PADDING);
  const startX = (svgWidth - totalW) / 2;

  return {
    svgWidth,
    nodeW,
    gap,
    startX,
    getNodeX: (index: number) => startX + index * (nodeW + gap),
  };
};
