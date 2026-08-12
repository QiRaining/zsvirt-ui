import { Tooltip } from "antd";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import architectureConsoleIcon from "../../assets/architecture-console.png";
import architectureDataGatewayIcon from "../../assets/architecture-data-gateway.png";
import architectureMnConsoleIcon from "../../assets/architecture-mn-console.png";
import architectureSourceVmIcon from "../../assets/architecture-source-vm.png";
import architectureTargetVmIcon from "../../assets/architecture-target-vm.png";
import architectureVmIcon from "../../assets/architecture-vm.png";
import { useContainerWidth } from "../../hooks";
import {
  ARCHITECTURE_GROUPS,
  ARCHITECTURE_HEIGHT,
  ARCHITECTURE_LINKS,
  ARCHITECTURE_NODE_HEIGHT,
  ARCHITECTURE_NODE_WIDTH,
  ARCHITECTURE_TARGET_NODE_WIDTH,
  ARCHITECTURE_WIDTH,
  type ArchitectureGroup,
  type ArchitectureLink,
  type ArchitectureNode,
  type ArchitectureNodeVariant,
} from "./architecture-canvas-data";
import { computeLayout } from "./compute-layout";
import {
  ARROW_COLOR,
  FLOW_NODE_LABEL_FONT_SIZE,
  ICON_TEXT_GAP,
  NODE_COUNT,
  NODE_ICON_LEFT,
  NODE_ICON_SIZE,
  NODE_RIGHT_PAD,
  SECONDARY_TEXT_COLOR,
  TEXT_COLOR,
} from "./constants";

import style from "../style.module.less";

const GROUP_TONES: Record<
  ArchitectureGroup["tone"],
  { fill: string; stroke: string }
> = {
  blue: {
    fill: "#e6f6ff",
    stroke: "#98d7fe",
  },
  purple: {
    fill: "#f9ecfe",
    stroke: "#e6b5fc",
  },
  yellow: {
    fill: "#fff8e5",
    stroke: "#ffe199",
  },
};

const NODE_ICON: Record<ArchitectureNodeVariant, string> = {
  sourceVm: architectureSourceVmIcon,
  gateway: architectureDataGatewayIcon,
  tempVm: architectureVmIcon,
  targetVm: architectureTargetVmIcon,
  migrationConsole: architectureConsoleIcon,
  mnConsole: architectureMnConsoleIcon,
};

const PORT_LABEL_WIDTH = 96;
const PORT_LABEL_HEIGHT = 24;

const getRequiredText = (
  messages: Record<string, string>,
  key: string,
  messageType: string,
) => {
  const message = messages[key];

  if (!message) {
    throw new Error(`Missing ${messageType} intl message: ${key}`);
  }

  return message;
};

const getNodeWidth = (node: ArchitectureNode) =>
  node.id === "temp-vm" ||
  node.id === "target-vm" ||
  node.id === "migration-console" ||
  node.id === "mn-console"
    ? ARCHITECTURE_TARGET_NODE_WIDTH
    : ARCHITECTURE_NODE_WIDTH;

const getGroup = (id: ArchitectureGroup["id"]) => {
  const group = ARCHITECTURE_GROUPS.find((item) => item.id === id);

  if (!group) {
    throw new Error(`Missing architecture group: ${id}`);
  }

  return group;
};

const translateGroup = (
  group: ArchitectureGroup,
  offsetX: number,
): ArchitectureGroup => {
  return {
    ...group,
    x: group.x + offsetX,
    nodes: group.nodes.map((node) => ({
      ...node,
      x: node.x + offsetX,
    })),
  };
};

const translatePoint = (
  point: [number, number],
  offsetX: number,
): [number, number] => [point[0] + offsetX, point[1]];

const translateLink = (
  link: ArchitectureLink,
  offsetX: number,
): ArchitectureLink => ({
  ...link,
  from: translatePoint(link.from, offsetX),
  to: translatePoint(link.to, offsetX),
  points: link.points?.map((point) => translatePoint(point, offsetX)),
  paths: link.paths?.map((path) => ({
    ...path,
    points: path.points.map((point) => translatePoint(point, offsetX)),
  })),
  text: link.text ? translatePoint(link.text, offsetX) : undefined,
});

const buildResponsiveArchitecture = (containerWidth: number) => {
  const layout = computeLayout(containerWidth);
  const width = Math.max(layout.svgWidth, ARCHITECTURE_WIDTH);
  const flowStartX = layout.startX;
  const flowEndX = layout.getNodeX(NODE_COUNT - 1) + layout.nodeW;
  const offsetX = flowStartX - 16;
  const targetGroup = getGroup("target");
  const targetX = targetGroup.x + offsetX;
  const targetWidth = Math.max(targetGroup.width, flowEndX - targetX);
  const targetRightNodeX = targetX + targetWidth - 194;

  const groups = ARCHITECTURE_GROUPS.map((group) => {
    const translatedGroup = translateGroup(group, offsetX);

    if (group.id !== "target") return translatedGroup;

    return {
      ...translatedGroup,
      width: targetWidth,
      nodes: translatedGroup.nodes.map((node) => {
        if (node.id !== "target-vm" && node.id !== "mn-console") return node;

        return {
          ...node,
          x: targetRightNodeX,
        };
      }),
    };
  });

  const targetNodeGapStart = targetX + 196;
  const targetNodeGapEnd = targetRightNodeX;
  const targetMidLabelX = (targetNodeGapStart + targetNodeGapEnd) / 2;
  const links = ARCHITECTURE_LINKS.map((link) => {
    const translatedLink = translateLink(link, offsetX);

    if (link.id === "temp-target-convert") {
      return {
        ...translatedLink,
        to: [targetNodeGapEnd, 78] as [number, number],
        text: [targetMidLabelX, 54] as [number, number],
      };
    }

    if (link.id === "console-mn-port") {
      return {
        ...translatedLink,
        to: [targetNodeGapEnd, 150] as [number, number],
        text: [targetMidLabelX, 170] as [number, number],
      };
    }

    return translatedLink;
  });

  return { width, groups, links };
};

const ArchitectureNodeBox: React.FC<{
  node: ArchitectureNode;
  label: string;
}> = React.memo(({ node, label }) => {
  const width = getNodeWidth(node);
  const icon = NODE_ICON[node.variant];
  const textLeft = NODE_ICON_LEFT + NODE_ICON_SIZE + ICON_TEXT_GAP;
  const textAreaWidth = width - textLeft - NODE_RIGHT_PAD;

  return (
    <g>
      <rect
        x={node.x}
        y={node.y}
        width={width}
        height={ARCHITECTURE_NODE_HEIGHT}
        rx={2}
        fill="#fff"
        stroke="#dbdde0"
        strokeDasharray={node.dashed ? "3 3" : undefined}
      />
      <image
        href={icon}
        x={node.x + NODE_ICON_LEFT}
        y={node.y + (ARCHITECTURE_NODE_HEIGHT - NODE_ICON_SIZE) / 2}
        width={NODE_ICON_SIZE}
        height={NODE_ICON_SIZE}
        preserveAspectRatio="xMidYMid meet"
      />
      <foreignObject
        x={node.x + textLeft}
        y={node.y}
        width={textAreaWidth}
        height={ARCHITECTURE_NODE_HEIGHT}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            height: "100%",
            width: "100%",
          }}
        >
          <Tooltip title={label} placement="top">
            <span
              style={{
                color: TEXT_COLOR,
                display: "-webkit-box",
                fontSize: FLOW_NODE_LABEL_FONT_SIZE,
                lineHeight: "1.3",
                minWidth: 0,
                overflow: "hidden",
                WebkitBoxOrient: "vertical" as const,
                WebkitLineClamp: 2,
                wordBreak: "break-word",
              }}
            >
              {label}
            </span>
          </Tooltip>
        </div>
      </foreignObject>
    </g>
  );
});

const ArchitectureGroupBox: React.FC<{
  group: ArchitectureGroup;
  title: string;
  nodeLabels: Record<string, string>;
}> = React.memo(({ group, title, nodeLabels }) => {
  const tone = GROUP_TONES[group.tone];

  return (
    <g>
      <rect
        x={group.x}
        y={group.y}
        width={group.width}
        height={group.height}
        rx={2}
        fill={tone.fill}
        stroke={tone.stroke}
      />
      <text
        x={group.x + 16}
        y={group.y + 24}
        dominantBaseline="middle"
        fill={TEXT_COLOR}
        fontSize={FLOW_NODE_LABEL_FONT_SIZE}
      >
        {title}
      </text>
      {group.nodes.map((node) => (
        <ArchitectureNodeBox
          key={node.id}
          node={node}
          label={getRequiredText(nodeLabels, node.id, "architecture node")}
        />
      ))}
      {group.hasEllipsis && (
        <text
          x={group.x + group.width / 2}
          y={group.y + 98}
          fill={SECONDARY_TEXT_COLOR}
          fontSize={FLOW_NODE_LABEL_FONT_SIZE}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ...
        </text>
      )}
    </g>
  );
});

const ArrowLine: React.FC<{
  link: ArchitectureLink;
  label: string;
  tooltip?: React.ReactNode;
}> = React.memo(({ link, label, tooltip }) => {
  const markerStart = link.bidirectional
    ? "url(#architectureArrowStart)"
    : undefined;
  const markerEnd =
    link.tone === "gray" ? undefined : "url(#architectureArrowEnd)";
  const stroke = link.tone === "gray" ? "#c0c4cc" : ARROW_COLOR;
  const isPortLink = link.id.includes("port");
  const labelColor =
    link.tone === "gray" || !isPortLink ? TEXT_COLOR : SECONDARY_TEXT_COLOR;
  const polylinePoints = link.points
    ?.map(([pointX, pointY]) => `${pointX},${pointY}`)
    .join(" ");
  const renderPolyline = (
    points: [number, number][],
    pathMarkerStart?: boolean,
    pathMarkerEnd?: boolean,
  ) => (
    <polyline
      points={points.map(([pointX, pointY]) => `${pointX},${pointY}`).join(" ")}
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinejoin="round"
      markerStart={pathMarkerStart ? "url(#architectureArrowStart)" : undefined}
      markerEnd={pathMarkerEnd ? "url(#architectureArrowEnd)" : undefined}
    />
  );

  return (
    <g>
      {link.labelOnly ? null : link.paths ? (
        link.paths.map((path, index) => (
          <React.Fragment key={`${link.id}-${index}`}>
            {renderPolyline(path.points, path.markerStart, path.markerEnd)}
          </React.Fragment>
        ))
      ) : polylinePoints ? (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          markerStart={markerStart}
          markerEnd={markerEnd}
        />
      ) : (
        <line
          x1={link.from[0]}
          y1={link.from[1]}
          x2={link.to[0]}
          y2={link.to[1]}
          stroke={stroke}
          strokeWidth={2}
          markerStart={markerStart}
          markerEnd={markerEnd}
        />
      )}
      {link.text && (
        <>
          {tooltip ? (
            <foreignObject
              x={link.text[0] - PORT_LABEL_WIDTH / 2}
              y={link.text[1] - PORT_LABEL_HEIGHT / 2}
              width={PORT_LABEL_WIDTH}
              height={PORT_LABEL_HEIGHT}
            >
              <Tooltip title={tooltip} placement="top">
                <span
                  style={{
                    alignItems: "center",
                    color: labelColor,
                    cursor: "pointer",
                    display: "flex",
                    fontSize: FLOW_NODE_LABEL_FONT_SIZE,
                    height: PORT_LABEL_HEIGHT,
                    justifyContent: "center",
                    lineHeight: `${PORT_LABEL_HEIGHT}px`,
                    textDecoration: "underline",
                    width: PORT_LABEL_WIDTH,
                  }}
                >
                  {label}
                </span>
              </Tooltip>
            </foreignObject>
          ) : (
            <text
              x={link.text[0]}
              y={link.text[1]}
              dominantBaseline="middle"
              fill={labelColor}
              fontSize={FLOW_NODE_LABEL_FONT_SIZE}
              textAnchor="middle"
              textDecoration={isPortLink ? "underline" : undefined}
            >
              {label}
            </text>
          )}
        </>
      )}
    </g>
  );
});

export const NetworkArchitectureFlow: React.FC = React.memo(() => {
  const intl = useIntl();
  const { containerRef, width: containerWidth } = useContainerWidth();
  const {
    width: architectureWidth,
    groups,
    links,
  } = useMemo(
    () => buildResponsiveArchitecture(containerWidth),
    [containerWidth],
  );

  const groupTitles = {
    source: intl.formatMessage({
      id: "migration.architecture.source",
      defaultMessage: "Source Platform",
    }),
    gateway: intl.formatMessage({
      id: "migration.architecture.gateway",
      defaultMessage: "Transit Server",
    }),
    target: intl.formatMessage({
      id: "migration.architecture.target",
      defaultMessage: "Target Platform",
    }),
  };

  const nodeLabels: Record<string, string> = {
    "source-vm-top": intl.formatMessage({
      id: "migration.architecture.source.vm",
      defaultMessage: "Source VM",
    }),
    "source-vm-bottom": intl.formatMessage({
      id: "migration.architecture.source.vm",
      defaultMessage: "Source VM",
    }),
    "gateway-top": intl.formatMessage({
      id: "migration.architecture.data.gateway",
      defaultMessage: "Data Gateway",
    }),
    "gateway-bottom": intl.formatMessage({
      id: "migration.architecture.data.gateway",
      defaultMessage: "Data Gateway",
    }),
    "temp-vm": intl.formatMessage({
      id: "migration.architecture.temp.vm",
      defaultMessage: "Temporary VM",
    }),
    "target-vm": intl.formatMessage({
      id: "migration.architecture.target.vm",
      defaultMessage: "Target VM",
    }),
    "migration-console": intl.formatMessage({
      id: "migration.architecture.console",
      defaultMessage: "Migration Service Console",
    }),
    "mn-console": intl.formatMessage({
      id: "migration.architecture.mn.console",
      defaultMessage: "Target MN Console",
    }),
  };

  const linkLabels: Record<string, string> = {
    "source-gateway-port": intl.formatMessage({
      id: "migration.architecture.view.port",
      defaultMessage: "View Port",
    }),
    "gateway-target-transfer-top": intl.formatMessage({
      id: "migration.architecture.data.transfer",
      defaultMessage: "Data Transfer",
    }),
    "gateway-target-transfer-bottom": intl.formatMessage({
      id: "migration.architecture.data.transfer",
      defaultMessage: "Data Transfer",
    }),
    "gateway-target-port": intl.formatMessage({
      id: "migration.architecture.view.port",
      defaultMessage: "View Port",
    }),
    "temp-target-convert": intl.formatMessage({
      id: "migration.architecture.system.convert",
      defaultMessage: "System Conversion",
    }),
    "temp-console-port": intl.formatMessage({
      id: "migration.architecture.view.port",
      defaultMessage: "View Port",
    }),
    "console-mn-port": intl.formatMessage({
      id: "migration.architecture.view.port",
      defaultMessage: "View Port",
    }),
  };

  const portTooltips: Record<string, React.ReactNode> = {
    "source-gateway-port": (
      <span style={{ whiteSpace: "pre-line" }}>
        {intl.formatMessage({
          id: "migration.architecture.port.tooltip.source.gateway",
          defaultMessage:
            "The transit server accesses the source platform using ports 443 and 902. The source platform accesses the transit server using ports 20000, 20001, 20010, and 20443.",
        })}
      </span>
    ),
    "gateway-target-port": (
      <span style={{ whiteSpace: "pre-line" }}>
        {intl.formatMessage({
          id: "migration.architecture.port.tooltip.gateway.target",
          defaultMessage:
            "When communication occurs between the transit server, temporary VM, and migration service console, ports 20000, 20001, 20010, and 20443 are used.",
        })}
      </span>
    ),
    "temp-console-port": (
      <span style={{ whiteSpace: "pre-line" }}>
        {intl.formatMessage({
          id: "migration.architecture.port.tooltip.gateway.temp.console",
          defaultMessage:
            "When communication occurs between the transit server, temporary VM, and migration service console, ports 20000, 20001, 20010, and 20443 are used.",
        })}
      </span>
    ),
    "console-mn-port": (
      <span style={{ whiteSpace: "pre-line" }}>
        {intl.formatMessage({
          id: "migration.architecture.port.tooltip.console.mn",
          defaultMessage: "The migration service console accesses the target MN console through port 8080.",
        })}
      </span>
    ),
  };

  return (
    <div className={style["architecture-flow"]}>
      <div className={style["flowchart-flow-title"]}>
        {intl.formatMessage({
          id: "migration.architecture.title",
          defaultMessage: "Overall Network Architecture",
        })}
      </div>
      <div className={style["architecture-flow-scroll"]} ref={containerRef}>
        <svg
          role="img"
          aria-label={intl.formatMessage({
            id: "migration.architecture.aria",
            defaultMessage: "Overall Network Architecture",
          })}
          viewBox={`0 0 ${architectureWidth} ${ARCHITECTURE_HEIGHT}`}
          width={architectureWidth}
          height={ARCHITECTURE_HEIGHT}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="architectureArrowEnd"
              markerWidth="5"
              markerHeight="4"
              refX="4.5"
              refY="2"
              orient="auto"
            >
              <path d="M0,0 L5,2 L0,4 Z" fill={ARROW_COLOR} />
            </marker>
            <marker
              id="architectureArrowStart"
              markerWidth="5"
              markerHeight="4"
              refX="0.5"
              refY="2"
              orient="auto"
            >
              <path d="M5,0 L0,2 L5,4 Z" fill={ARROW_COLOR} />
            </marker>
          </defs>
          <rect
            x={0.5}
            y={0.5}
            width={architectureWidth - 1}
            height={ARCHITECTURE_HEIGHT - 1}
            rx={2}
            fill="#fff"
            stroke="#dbdde0"
            strokeDasharray="3 3"
          />

          {groups.map((group) => (
            <ArchitectureGroupBox
              key={group.id}
              group={group}
              title={groupTitles[group.id as keyof typeof groupTitles]}
              nodeLabels={nodeLabels}
            />
          ))}

          {links.map((link) => (
            <ArrowLine
              key={link.id}
              link={link}
              label={getRequiredText(linkLabels, link.id, "architecture link")}
              tooltip={portTooltips[link.id]}
            />
          ))}
        </svg>
      </div>
    </div>
  );
});

NetworkArchitectureFlow.displayName = "NetworkArchitectureFlow";
