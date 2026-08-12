import { FlowAnalysisGraph } from "@ant-design/charts";
import { formatTime } from "@zstack/zsphere-utils";
import {
  useDebounceEffect,
  useFullscreen,
  useSize,
  useToggle,
  useUpdateEffect,
} from "ahooks";
import cls from "classnames";
import { useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";

import Legend from "./legend";
import { registerBehavior, registerEdge, registerNode } from "./register";
import Toolbar from "./toolbar";
import type {
  IModelConfig,
  INetworkTopoProps,
  INode,
  IResourceType,
} from "./type";

import style from "./style.module.less";

registerNode();
registerEdge();
registerBehavior();

const NetworkTopo = ({
  dataSource,
  loading,
  defaultVmVisible = true,
  hostCount,
  clusterCount,
  l2Count,
  l3Count,
  vmCount,
  onRefresh,
  onDownloadImage,
  customTooltipContent,
  onToggleFullscreen,
}: INetworkTopoProps) => {
  const intl = useIntl();
  const [vmVisible, { toggle: toggleVmVisible }] = useToggle(defaultVmVisible);
  const [tooltipVisible, { toggle: toggleTooltipVisible }] = useToggle(false);
  const [legendCollapsed, { toggle: toggleLegendCollapsed }] = useToggle(false);
  const [tooltipPosition, setTooltipPosition] = useState<[number, number]>([
    0, 0,
  ]);
  const [tooltipNode, setTooltipNode] = useState<INode>();
  const mouseIsOnNode = useRef<boolean>(false);
  const mouseIsOnTooltip = useRef<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>();
  const canvasSize = useSize(canvasRef);

  const [fullscreen, { toggleFull: toggleFullscreen }] =
    useFullscreen(containerRef);

  const data = useMemo(() => {
    const nodes: any[] = [];
    const edges: any[] = [];
    dataSource?.forEach((item) => {
      const {
        id: currentId,
        resourceType,
        title,
        detail,
        relations = {},
      } = item;
      // 当前资源信息
      const node = {
        id: currentId,
        resourceType,
        value: {
          title,
        },
        detail,
        relations,
      };
      nodes.push(node);
      // 处理资源关系
      switch (resourceType) {
        case "host":
          relations.cluster?.forEach((target) => {
            edges.push({
              source: currentId,
              target,
            });
          });
          break;
        case "cluster":
          relations.l2?.forEach((target) => {
            edges.push({
              source: currentId,
              target,
            });
          });
          break;
        case "l2":
          relations.l3?.forEach((target) => {
            edges.push({
              source: currentId,
              target,
            });
          });
          break;
        case "l3":
          relations.vm?.forEach((target) => {
            edges.push({
              source: currentId,
              target,
            });
          });
          break;
        default:
          break;
      }
    });

    return {
      nodes,
      edges,
    };
  }, [dataSource]);

  const resourceTypeMap = useMemo(
    () =>
      new Map<IResourceType, string>([
        ["host", intl.formatMessage({ id: "host", defaultMessage: "Host" })],
        [
          "cluster",
          intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
        ],
        ["l2", intl.formatMessage({ id: "switch", defaultMessage: "Switch" })],
        [
          "l3",
          intl.formatMessage({ id: "port.group", defaultMessage: "Port Group" }),
        ],
        ["vm", intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })],
      ]),
    [intl],
  );

  const renderTooltip = useMemo(() => {
    if (!customTooltipContent) {
      return null;
    }
    const [left, top] = tooltipPosition;
    return (
      <div
        className={style["network-topo-tooltip"]}
        style={{
          left,
          top,
          display: tooltipVisible ? "block" : "none",
        }}
        onMouseEnter={() => {
          mouseIsOnTooltip.current = true;
          toggleTooltipVisible(true);
        }}
        onMouseLeave={() => {
          mouseIsOnTooltip.current = false;
          toggleTooltipVisible(false);
        }}
      >
        <div className={style["network-topo-tooltip-container"]}>
          {tooltipNode && customTooltipContent(tooltipNode)}
        </div>
      </div>
    );
  }, [customTooltipContent, tooltipPosition, tooltipVisible, tooltipNode]);

  const renderGraph = useMemo(() => {
    const canvas = canvasRef.current;
    if (!data || !canvas) {
      return null;
    }
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    return (
      <FlowAnalysisGraph
        data={data}
        className={style["network-topo"]}
        nodeCfg={{
          type: "resource-node",
          nodeStateStyles: undefined,
          style: {
            noneText: intl.formatMessage({ id: "none", defaultMessage: "None" }),
          },
        }}
        edgeCfg={{
          type: "resource-edge",
          edgeStateStyles: undefined,
        }}
        layout={{
          rankdir: "LR",
          nodesepFunc: () => 1,
        }}
        behaviors={["zoom-canvas", "drag-canvas", "highlight"]}
        width={width}
        height={height}
        fitCenter
        animate={false}
        autoFit={false}
        onReady={(graph) => {
          graphRef.current = graph;
          graph.on("node:mouseenter", (e: any) => {
            const targetName = e.target.cfg.name;
            if (!["title", "icon"].includes(targetName)) {
              return;
            }
            const model = e.item?.getModel() as any;
            if (model && !mouseIsOnNode.current) {
              mouseIsOnNode.current = true;
              const { x = 0, y = 0, resourceType, detail = {} as any } = model;
              setTooltipNode({
                resourceType,
                detail,
              });
              const zoom = graph.getZoom();
              const point = graph.getCanvasByPoint(x, y);
              let left = point.x;
              let top = point.y;
              switch (resourceType) {
                case "host":
                  left += 55 * zoom;
                  top += 50;
                  break;
                case "cluster":
                  left += 77 * zoom;
                  top += 45;
                  break;
                case "l2":
                  left += 52 * zoom;
                  top += 45;
                  break;
                case "l3":
                  left += 52 * zoom;
                  top += 50;
                  break;
                case "vm":
                  left += 45 * zoom;
                  top += 50;
                  break;
                default:
                  break;
              }
              setTooltipPosition([left, top]);
              toggleTooltipVisible(true);
            }
          });
          graph.on("node:mouseleave", () => {
            mouseIsOnNode.current = false;
            setTimeout(() => {
              if (!mouseIsOnNode.current && !mouseIsOnTooltip.current) {
                toggleTooltipVisible(false);
              }
            }, 500);
          });
        }}
      />
    );
  }, [data, intl]);

  const handleZoomIn = () => {
    const graph = graphRef.current;
    graph?.zoom(1.1);
  };
  const handleZoomOut = () => {
    const graph = graphRef.current;
    graph?.zoom(0.9);
  };
  const handleReset = () => {
    const graph = graphRef.current;
    graph?.zoomTo(1);
    graph?.fitCenter();
  };
  const handleDownload = () => {
    const graph = graphRef.current;
    const timestamp = Date.now();
    try {
      const imageName =
        intl.formatMessage({
          id: "download.topo",
          defaultMessage: "Download",
        }) + formatTime(timestamp);
      graph?.downloadFullImage(imageName, "image/png", {
        backgroundColor: "white",
        padding: 20,
      });
      onDownloadImage?.({ success: true, timestamp });
    } catch {
      onDownloadImage?.({ success: false, timestamp });
    }
  };
  const handleFocus = (id: string) => {
    const graph = graphRef.current;
    graph?.zoomTo(1);
    graph?.focusItem(id);
  };
  const handleToggleFullscreen = () => {
    toggleFullscreen();
  };

  const renderToolbar = useMemo(
    () => (
      <Toolbar
        onRefresh={onRefresh}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onDownload={handleDownload}
        onToggleVmVisible={toggleVmVisible}
        vmVisible={vmVisible}
        onToggleFullscreen={handleToggleFullscreen}
        fullscreen={fullscreen}
      />
    ),
    [fullscreen, vmVisible],
  );

  const renderLegend = useMemo(
    () => (
      <Legend
        dataSource={dataSource}
        hostCount={hostCount}
        clusterCount={clusterCount}
        l2Count={l2Count}
        l3Count={l3Count}
        vmCount={vmCount}
        resourceTypeMap={resourceTypeMap}
        collapsed={legendCollapsed}
        setCollapsed={toggleLegendCollapsed}
        onSelect={handleFocus}
      />
    ),
    [
      clusterCount,
      dataSource,
      hostCount,
      l2Count,
      l3Count,
      legendCollapsed,
      resourceTypeMap,
      vmCount,
    ],
  );

  useUpdateEffect(() => {
    const graph = graphRef.current;
    const { width, height } = canvasSize;
    if (graph && width && height) {
      graph.changeSize(width, height);
    }
  }, [canvasSize]);

  useDebounceEffect(
    () => {
      const graph = graphRef.current;
      if (graph) {
        graph.fitCenter();
      }
    },
    [canvasSize],
    { wait: 50 },
  );

  useUpdateEffect(() => {
    toggleLegendCollapsed(fullscreen);
    onToggleFullscreen?.(fullscreen);
  }, [fullscreen]);

  useUpdateEffect(() => {
    const graph = graphRef.current;
    if (graph) {
      const vmNodes = graph.findAll("node", (item: any) => {
        const model = item.getModel() as IModelConfig;
        return model.resourceType === "vm";
      });
      const l3Nodes = graph.findAll("node", (item: any) => {
        const model = item.getModel() as IModelConfig;
        return model.resourceType === "l3";
      });
      if (vmVisible) {
        vmNodes.forEach((item: any) => {
          graph.showItem(item);
        });
        l3Nodes.forEach((item: any) => {
          graph.setItemState(item, "childrenCollapsed", false);
        });
      } else {
        vmNodes.forEach((item: any) => {
          graph.hideItem(item);
        });
        l3Nodes.forEach((item: any) => {
          graph.setItemState(item, "childrenCollapsed", true);
        });
      }
    }
  }, [vmVisible]);

  useDebounceEffect(
    () => {
      if (!loading) {
        handleReset();
      }
    },
    [loading],
    { wait: 100 },
  );

  return (
    <div
      className={style["network-topo-container"]}
      id="network-topo-container"
      ref={containerRef}
    >
      {renderToolbar}
      {renderLegend}
      <div
        className={cls(style["network-topo-canvas"], {
          [style.legendCollapsed]: legendCollapsed,
        })}
        ref={canvasRef}
      >
        {renderGraph}
      </div>
      {renderTooltip}
    </div>
  );
};

export default NetworkTopo;
