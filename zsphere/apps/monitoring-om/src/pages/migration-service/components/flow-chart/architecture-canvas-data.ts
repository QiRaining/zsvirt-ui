export type ArchitectureNodeVariant =
  | "sourceVm"
  | "gateway"
  | "tempVm"
  | "targetVm"
  | "migrationConsole"
  | "mnConsole";

export interface ArchitectureNode {
  id: string;
  label: string;
  x: number;
  y: number;
  dashed?: boolean;
  variant: ArchitectureNodeVariant;
}

export interface ArchitectureGroup {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tone: "blue" | "purple" | "yellow";
  nodes: ArchitectureNode[];
  hasEllipsis?: boolean;
}

export interface ArchitectureLinkPath {
  points: [number, number][];
  markerStart?: boolean;
  markerEnd?: boolean;
}

export interface ArchitectureLink {
  id: string;
  label: string;
  from: [number, number];
  to: [number, number];
  points?: [number, number][];
  paths?: ArchitectureLinkPath[];
  bidirectional?: boolean;
  labelOnly?: boolean;
  text?: [number, number];
  tone?: "blue" | "gray";
}

export const ARCHITECTURE_WIDTH = 1112;
export const ARCHITECTURE_HEIGHT = 202;
export const ARCHITECTURE_NODE_WIDTH = 160;
export const ARCHITECTURE_NODE_HEIGHT = 40;
export const ARCHITECTURE_TARGET_NODE_WIDTH = 180;

export const ARCHITECTURE_GROUPS: ArchitectureGroup[] = [
  {
    id: "source",
    title: "源平台",
    x: 16,
    y: 16,
    width: 192,
    height: 170,
    tone: "blue",
    hasEllipsis: true,
    nodes: [
      {
        id: "source-vm-top",
        label: "源虚拟机",
        x: 32,
        y: 58,
        variant: "sourceVm",
      },
      {
        id: "source-vm-bottom",
        label: "源虚拟机",
        x: 32,
        y: 130,
        variant: "sourceVm",
      },
    ],
  },
  {
    id: "gateway",
    title: "中转服务器",
    x: 312,
    y: 16,
    width: 192,
    height: 170,
    tone: "purple",
    hasEllipsis: true,
    nodes: [
      {
        id: "gateway-top",
        label: "数据网关",
        x: 328,
        y: 58,
        variant: "gateway",
      },
      {
        id: "gateway-bottom",
        label: "数据网关",
        x: 328,
        y: 130,
        variant: "gateway",
      },
    ],
  },
  {
    id: "target",
    title: "目标平台",
    x: 608,
    y: 16,
    width: 486,
    height: 170,
    tone: "yellow",
    nodes: [
      {
        id: "temp-vm",
        label: "临时虚拟机",
        x: 624,
        y: 58,
        dashed: true,
        variant: "tempVm",
      },
      {
        id: "target-vm",
        label: "目标虚拟机",
        x: 900,
        y: 58,
        variant: "targetVm",
      },
      {
        id: "migration-console",
        label: "迁移服务控制台",
        x: 624,
        y: 130,
        variant: "migrationConsole",
      },
      {
        id: "mn-console",
        label: "目标 MN 控制台",
        x: 900,
        y: 130,
        variant: "mnConsole",
      },
    ],
  },
];

export const ARCHITECTURE_LINKS: ArchitectureLink[] = [
  {
    id: "source-gateway-port",
    label: "查看端口",
    from: [208, 109],
    to: [312, 109],
    paths: [
      {
        points: [
          [312, 101],
          [208, 101],
        ],
        markerEnd: true,
      },
      {
        points: [
          [208, 117],
          [312, 117],
        ],
        markerEnd: true,
      },
    ],
    text: [260, 142],
    tone: "blue",
  },
  {
    id: "gateway-target-transfer-top",
    label: "数据传输",
    from: [504, 78],
    to: [624, 78],
    paths: [
      {
        points: [
          [624, 66],
          [592, 66],
          [552, 102],
          [504, 102],
        ],
        markerEnd: true,
      },
      {
        points: [
          [504, 114],
          [552, 114],
        ],
      },
      {
        points: [
          [552, 114],
          [592, 78],
          [624, 78],
        ],
        markerEnd: true,
      },
    ],
    text: [564, 50],
    tone: "blue",
  },
  {
    id: "gateway-target-port",
    label: "查看端口",
    from: [504, 150],
    to: [624, 150],
    paths: [
      {
        points: [
          [552, 114],
          [592, 150],
          [624, 150],
        ],
        markerEnd: true,
      },
      {
        points: [
          [624, 166],
          [592, 166],
          [552, 126],
          [504, 126],
        ],
        markerEnd: true,
      },
    ],
    text: [564, 169],
    tone: "blue",
  },
  {
    id: "temp-target-convert",
    label: "系统转换",
    from: [804, 78],
    to: [900, 78],
    text: [852, 54],
    tone: "gray",
  },
  {
    id: "temp-console-port",
    label: "查看端口",
    from: [714, 98],
    to: [714, 130],
    bidirectional: true,
    text: [746, 117],
    tone: "blue",
  },
  {
    id: "console-mn-port",
    label: "查看端口",
    from: [804, 150],
    to: [900, 150],
    text: [852, 170],
    tone: "blue",
  },
];
