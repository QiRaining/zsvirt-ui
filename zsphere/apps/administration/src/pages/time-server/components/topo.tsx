import type { Edge, Node, NodeProps } from "@xyflow/react";
import {
  Handle,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { cn } from "@zstack/utils";
import type {
  TimeServerResult,
  TimeServerStatus,
} from "@zstack/zsphere-types/graphql";

import "@xyflow/react/dist/style.css";
import type { FC } from "react";
import { memo, useEffect } from "react";
import { useIntl } from "react-intl";

import externalIcon from "../assets/external.webp";
import internalIcon from "../assets/internal.webp";
import cloudIcon from "../assets/monitor.webp";

import styles from "../style.module.less";

interface ServerNodeData {
  label: string;
  serverType: "internal" | "external" | "cloud";
  hostname?: string;
  status?: TimeServerStatus;
}

interface IProps {
  data?: TimeServerResult;
}

// 自定义服务器节点组件
const ServerNode = memo(({ data }: NodeProps<Node<ServerNodeData>>) => {
  const isInternalNode = data.serverType === "internal";
  const isExternalNode = data.serverType === "external";
  const isCloudNode = data.serverType === "cloud";
  const nodeWidth = 200;
  const nodeHeight = isCloudNode ? 40 : 60;

  let iconSrc = cloudIcon;
  if (isInternalNode) {
    iconSrc = internalIcon;
  }
  if (isExternalNode) {
    iconSrc = externalIcon;
  }

  const isConnected = data.status === "Connected";

  return (
    <div
      className="flex flex-row overflow-hidden rounded-sm bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)]"
      style={{ width: nodeWidth, height: nodeHeight }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!border-none !bg-transparent"
      />

      {/* 左侧蓝色边框 */}
      <div className="w-1 flex-shrink-0 bg-[#65BBFC]" />

      {/* 主要内容区 */}
      <div className="flex flex-1 flex-col">
        {/* 上半部分：图标和标签 */}
        <div
          className={cn(
            "flex items-center gap-2",
            isCloudNode ? "flex-1 px-3 py-[9px]" : "px-3 pt-[9px]",
          )}
        >
          {/* 图标背景 */}
          <div className="relative flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-sm bg-[#0076F7]">
            <img src={iconSrc} alt="" className="h-4 w-4" />
            {/* 状态指示器（非云节点） */}
            {!isCloudNode && (
              <div
                className={cn(
                  "absolute right-[-2px] bottom-[-2px] h-2 w-2 rounded-full border border-white",
                  isConnected ? "bg-[#57D344]" : "bg-[#F4454C]",
                )}
              />
            )}
          </div>

          {/* 标签文本 */}
          <div className="flex-1 text-sm text-[#4A4C4F]">{data.label}</div>
        </div>

        {/* 下半部分：主机名（非云节点） */}
        {!isCloudNode && (
          <div className="flex items-center pt-1.5 pr-[11px] pb-2.5 pl-8">
            <div className="flex-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-[#96989B]">
              {data.hostname}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!border-none !bg-transparent"
      />
    </div>
  );
});

ServerNode.displayName = "ServerNode";

// 云平台分组节点组件
const CloudGroupNode = memo(({ data }: NodeProps<Node<{ label: string }>>) => {
  return (
    <div className="flex h-full w-full flex-col">
      {/* 标签 */}
      <div className="mb-1.5 text-center text-sm text-[#707275]">
        {data.label}
      </div>
      {/* 分组容器 */}
      <div className="flex-1 rounded-lg border border-dashed border-[#C8CACD] bg-white/50" />
    </div>
  );
});

CloudGroupNode.displayName = "CloudGroupNode";

function useGraphData(data?: TimeServerResult) {
  const intl = useIntl();
  const internalServers = data?.servers.internal || [];
  const internalServerCount = internalServers.length;
  const externalServers = data?.servers.external || [];
  const externalServerCount = externalServers.length;
  const relations = data?.relations || [];

  const horizontalSpacing = 80;
  const verticalSpacing = 40;
  const nodeWidth = 200;
  const nodeHeight = 60;
  const cloudNodeHeight = 40;

  // 计算水平方向位置
  const externalNodeX = 0;
  // cloudGroup 紧跟在外部节点右侧，若无外部节点则在起始位置
  const cloudGroupColumnX = externalServerCount
    ? externalNodeX + nodeWidth + horizontalSpacing
    : 0;
  // 内部节点在 cloudGroup 内部，使用相对坐标（comboPaddingX）

  // 计算垂直方向位置
  const maxRowCount = Math.max(internalServerCount, externalServerCount);
  const medianLine =
    ((verticalSpacing + nodeHeight) * (maxRowCount - 1) + nodeHeight) / 2;
  const externalFirstRow =
    medianLine -
    (externalServerCount / 2) * nodeHeight -
    ((externalServerCount - 1) / 2) * verticalSpacing;

  // 创建节点
  const externalNodes: Node<ServerNodeData>[] = externalServers.map(
    (node, index) => ({
      id: node.id,
      type: "server",
      position: {
        x: externalNodeX,
        y: externalFirstRow + index * (nodeHeight + verticalSpacing),
      },
      data: {
        label: intl.formatMessage({
          id: "external.ntp",
          defaultMessage: "External Time Server",
        }),
        serverType: "external",
        hostname: node.hostname,
        status: node.status,
      },
    }),
  );

  const labelHeight = 26;
  const comboPaddingX = 40;
  const comboPaddingY = 40;

  const internalTotalHeight =
    internalServerCount > 0
      ? (internalServerCount - 1) * (nodeHeight + verticalSpacing) + nodeHeight
      : 0;

  let internalNodesStartY: number;
  let cloudNodeY: number;

  if (internalServerCount > 0) {
    internalNodesStartY = comboPaddingY + labelHeight;
    cloudNodeY =
      internalNodesStartY + internalTotalHeight / 2 - cloudNodeHeight / 2;
  } else {
    internalNodesStartY = comboPaddingY + labelHeight;
    cloudNodeY = internalNodesStartY;
  }

  const internalNodes: Node<ServerNodeData>[] = internalServers.map(
    (node, index) => ({
      id: node.id,
      type: "server",
      position: {
        x: comboPaddingX,
        y: internalNodesStartY + index * (nodeHeight + verticalSpacing),
      },
      data: {
        label: intl.formatMessage({
          id: "internal.ntp",
          defaultMessage: "Internal Time Server",
        }),
        serverType: "internal",
        hostname: node.hostname,
        status: node.status,
      },
      parentId: "cloudGroup",
      extent: "parent" as const,
    }),
  );

  const cloudNode: Node<ServerNodeData> = {
    id: "0",
    type: "server",
    position: {
      x: internalNodes.length > 0 ? 280 : comboPaddingX,
      y: cloudNodeY,
    },
    data: {
      label: intl.formatMessage({
        id: "platform.time",
        defaultMessage: "Platform Time",
      }),
      serverType: "cloud",
    },
    parentId: "cloudGroup",
    extent: "parent" as const,
  };

  // 创建边
  const edgeStyle = { stroke: "#DBDDE0", strokeWidth: 2 };

  const relationEdges: Edge[] = relations.map((item) => ({
    id: `${item.source}-${item.target}`,
    source: item.source,
    target: item.target,
    type: "default",
    style: edgeStyle,
  }));

  let cloudEdges: Edge[] = [];

  if (internalServerCount && !externalServerCount) {
    cloudEdges = internalNodes.map((node) => ({
      id: `${node.id}-${cloudNode.id}`,
      source: node.id,
      target: cloudNode.id,
      type: "default",
      style: edgeStyle,
    }));
  }
  if (!internalServerCount && externalServerCount) {
    cloudEdges = externalNodes.map((node) => ({
      id: `${node.id}-${cloudNode.id}`,
      source: node.id,
      target: cloudNode.id,
      type: "default",
      style: edgeStyle,
    }));
  }
  if (internalServerCount && externalServerCount && relations.length > 0) {
    cloudEdges = internalNodes.map((node) => ({
      id: `${node.id}-${cloudNode.id}`,
      source: node.id,
      target: cloudNode.id,
      type: "default",
      style: edgeStyle,
    }));
  }

  // 创建父节点（云平台分组）
  const internalContentHeight =
    internalNodes.length > 0
      ? Math.max(
          ...[...internalNodes, cloudNode].map(
            (n) =>
              n.position.y +
              (n.data.serverType === "cloud" ? cloudNodeHeight : nodeHeight),
          ),
        )
      : cloudNodeY + cloudNodeHeight;

  const groupWidth =
    internalNodes.length > 0
      ? 280 + nodeWidth + comboPaddingX * 2
      : nodeWidth + comboPaddingX * 2;
  const groupHeight = internalContentHeight + comboPaddingY;

  const externalTotalHeight =
    externalServerCount > 0
      ? (externalServerCount - 1) * (nodeHeight + verticalSpacing) + nodeHeight
      : 0;

  const groupNodeY =
    externalServerCount > 0
      ? externalFirstRow + externalTotalHeight / 2 - groupHeight / 2
      : 0;

  const groupNode: Node = {
    id: "cloudGroup",
    type: "group",
    position: {
      x: cloudGroupColumnX - comboPaddingX,
      y: groupNodeY,
    },
    style: {
      width: groupWidth,
      height: groupHeight,
    },
    data: {
      label: intl.formatMessage({
        id: "cloudPlatform",
        defaultMessage: "platform Platform",
      }),
    },
  };

  const nodes = [...externalNodes, groupNode, ...internalNodes, cloudNode];
  const edges = [...relationEdges, ...cloudEdges];

  return { nodes, edges };
}

const nodeTypes = {
  server: ServerNode,
  group: CloudGroupNode,
};

const defaultEdgeOptions = {
  type: "smoothstep",
  style: { stroke: "#DBDDE0", strokeWidth: 2 },
  markerEnd: {
    type: "arrowclosed" as const,
    color: "#DBDDE0",
  },
};

// 内部组件：需要使用 useReactFlow
const TopoContent: FC<IProps> = ({ data }) => {
  const { nodes, edges } = useGraphData(data);
  const { fitView } = useReactFlow();

  // 节点变化后自动 fitView
  useEffect(() => {
    if (nodes.length) {
      fitView({ padding: 0.4 });
    }
  }, [nodes, fitView]);

  // 窗口 resize 时重新 fitView
  useEffect(() => {
    const handleResize = () => {
      fitView({ padding: 0.4 });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView={true}
      fitViewOptions={{ padding: 0.4 }}
      panOnDrag={false}
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
      nodesDraggable={false}
      nodesConnectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      elementsSelectable={false}
      selectNodesOnDrag={false}
      proOptions={{ hideAttribution: true }}
    />
  );
};

// 主组件：使用 ReactFlowProvider 包裹
const Topo: FC<IProps> = (props) => {
  return (
    <div className={styles.topoContainer}>
      <ReactFlowProvider>
        <TopoContent {...props} />
      </ReactFlowProvider>
    </div>
  );
};

export default Topo;
