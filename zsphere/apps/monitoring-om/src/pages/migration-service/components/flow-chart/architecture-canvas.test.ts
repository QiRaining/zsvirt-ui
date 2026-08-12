import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  ARCHITECTURE_GROUPS,
  ARCHITECTURE_HEIGHT,
  ARCHITECTURE_LINKS,
  ARCHITECTURE_WIDTH,
} from "./architecture-canvas-data";

const networkArchitectureSource = readFileSync(
  new URL("./network-architecture-flow.tsx", import.meta.url),
  "utf8",
);

describe("architecture canvas model", () => {
  it("describes the three platform groups shown in the overall network architecture", () => {
    expect(ARCHITECTURE_GROUPS.map((group) => group.title)).toEqual([
      "Source Platform",
      "Transit Server",
      "Target Platform",
    ]);
    expect(ARCHITECTURE_GROUPS[0].nodes.map((node) => node.label)).toEqual([
      "Source VM",
      "Source VM",
    ]);
    expect(ARCHITECTURE_GROUPS[1].nodes.map((node) => node.label)).toEqual([
      "Data Gateway",
      "Data Gateway",
    ]);
    expect(ARCHITECTURE_GROUPS[2].nodes.map((node) => node.label)).toEqual([
      "Temporary VM",
      "Target VM",
      "Migration Service Console",
      "Target MN Console",
    ]);
  });

  it("keeps the external and target-internal connection labels explicit", () => {
    expect(ARCHITECTURE_LINKS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: "View Port" }),
        expect.objectContaining({ label: "Data Transfer" }),
        expect.objectContaining({ label: "System Conversion" }),
      ]),
    );
  });

  it("uses the full-width Figma canvas proportion for the overall architecture", () => {
    expect(ARCHITECTURE_WIDTH).toBe(1112);
    expect(ARCHITECTURE_HEIGHT).toBe(202);
  });

  it("keeps architecture node labels aligned with the migration flow label typography", () => {
    expect(networkArchitectureSource).toContain(
      "fontSize: FLOW_NODE_LABEL_FONT_SIZE",
    );
    expect(networkArchitectureSource).toContain("WebkitLineClamp: 2");
    expect(networkArchitectureSource).toContain('wordBreak: "break-word"');
    expect(networkArchitectureSource).not.toContain("fontSize={14}");
  });

  it("draws external bidirectional traffic as separate directional paths", () => {
    const sourceGatewayLink = ARCHITECTURE_LINKS.find(
      (link) => link.id === "source-gateway-port",
    );
    const gatewayTargetTransferLink = ARCHITECTURE_LINKS.find(
      (link) => link.id === "gateway-target-transfer-top",
    );
    const gatewayTargetPortLink = ARCHITECTURE_LINKS.find(
      (link) => link.id === "gateway-target-port",
    );

    expect(sourceGatewayLink?.paths).toHaveLength(2);
    expect(sourceGatewayLink?.paths?.every((path) => path.markerEnd)).toBe(
      true,
    );
    expect(gatewayTargetTransferLink?.paths).toHaveLength(3);
    expect(
      gatewayTargetTransferLink?.paths?.some(
        (path) => !path.markerStart && !path.markerEnd,
      ),
    ).toBe(true);
    expect(gatewayTargetPortLink?.paths).toHaveLength(2);
  });

  it("keeps every view-port label backed by a static intl tooltip", () => {
    const portLinks = ARCHITECTURE_LINKS.filter((link) =>
      link.id.includes("port"),
    );

    expect(portLinks.map((link) => link.id)).toEqual([
      "source-gateway-port",
      "gateway-target-port",
      "temp-console-port",
      "console-mn-port",
    ]);
    expect(networkArchitectureSource).toContain(
      "migration.architecture.port.tooltip.source.gateway",
    );
    expect(networkArchitectureSource).toContain(
      "migration.architecture.port.tooltip.gateway.target",
    );
    expect(networkArchitectureSource).toContain(
      "migration.architecture.port.tooltip.gateway.temp.console",
    );
    expect(networkArchitectureSource).toContain(
      "migration.architecture.port.tooltip.console.mn",
    );
    expect(networkArchitectureSource).not.toContain("getMessage(");
    expect(networkArchitectureSource).not.toContain(
      "ARCHITECTURE_PORT_TOOLTIPS",
    );
  });
});
