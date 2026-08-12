import { Icon } from "@zstack/icon";
import { Tooltip } from "antd";
import React from "react";

import {
  NODE_H,
  NODE_RX,
  NODE_ICON_LEFT,
  NODE_ICON_SIZE,
  ICON_TEXT_GAP,
  NODE_RIGHT_PAD,
  INFO_ICON_GAP,
  TEXT_COLOR,
  ARROW_COLOR,
  FLOW_ARROW_STROKE_WIDTH,
  FLOW_NODE_LABEL_FONT_SIZE,
} from "./constants";
import type { NodeConfig } from "./types";

export const FlowNode: React.FC<NodeConfig> = React.memo(
  ({
    x,
    y,
    label,
    bg,
    border,
    nodeW,
    icon,
    iconColor,
    iconColorNumber,
    infoTooltip,
  }) => {
    const hasInfoIcon = Boolean(infoTooltip);
    const textLeft = NODE_ICON_LEFT + NODE_ICON_SIZE + ICON_TEXT_GAP;
    const textAreaWidth = nodeW - textLeft - NODE_RIGHT_PAD;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={nodeW}
          height={NODE_H}
          rx={NODE_RX}
          ry={NODE_RX}
          fill={bg}
          stroke={border}
          strokeWidth={1}
        />
        {/* Node icon via foreignObject */}
        <foreignObject
          x={x + NODE_ICON_LEFT}
          y={y + (NODE_H - NODE_ICON_SIZE) / 2}
          width={NODE_ICON_SIZE}
          height={NODE_ICON_SIZE}
        >
          <Icon
            type={icon as Parameters<typeof Icon>[0]["type"]}
            color={iconColor}
            colorNumber={iconColorNumber}
            style={{ width: NODE_ICON_SIZE, height: NODE_ICON_SIZE }}
          />
        </foreignObject>

        {/*
        Text + optional info icon in a single foreignObject.
        Icon sits right next to text, not pinned to the right edge.
      */}
        <foreignObject
          x={x + textLeft}
          y={y}
          width={textAreaWidth}
          height={NODE_H}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: INFO_ICON_GAP,
            }}
          >
            <Tooltip title={label} placement="top">
              <span
                style={{
                  color: TEXT_COLOR,
                  lineHeight: "1.3",
                  minWidth: 0,
                  flex: "0 1 auto",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const,
                  wordBreak: "break-word",
                  fontSize: FLOW_NODE_LABEL_FONT_SIZE,
                }}
              >
                {label}
              </span>
            </Tooltip>
            {hasInfoIcon && (
              <Tooltip title={infoTooltip} placement="top">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    type="info"
                    color="neutral"
                    colorNumber={500}
                    style={{ width: 16, height: 16 }}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        </foreignObject>
      </g>
    );
  },
);

// --- Shared helper: straight arrow ---
export const renderArrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  key: string,
) => (
  <g key={key}>
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={ARROW_COLOR}
      strokeWidth={FLOW_ARROW_STROKE_WIDTH}
      markerEnd="url(#arrowHead)"
    />
  </g>
);

// --- Shared arrow marker defs ---
export const ArrowDefs: React.FC = React.memo(() => (
  <defs>
    <marker
      id="arrowHead"
      markerWidth="5"
      markerHeight="4"
      refX="4.5"
      refY="2"
      orient="auto"
    >
      <path d="M0,0 L5,2 L0,4 Z" fill={ARROW_COLOR} />
    </marker>
  </defs>
));
