import type { Graph } from "@antv/g6";
import G6 from "@antv/g6";
import type { G6GraphEvent } from "@antv/g6/lib/interface/behavior";
import { useLazyQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { getNUMATopology } from "@zstack/virtualization-resource/src/gql/vm.gql";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useFullscreen, useSize, useToggle } from "ahooks";
import type { TooltipPlacement } from "antd/es/tooltip";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import event from "./event";
import getData from "./getData";
import register from "./register";

import styles from "./style.module.less";

interface IProps {
  vmName?: string;
  hostUuid?: string;
  hostName?: string;
  vmUuid?: string;
  visible: boolean;
  setVisible: any;
  setHostVisible?: any;
  openFromHost?: boolean;
}
const NumaTopologyModal: React.FC<IProps> = ({
  visible,
  setVisible,
  openFromHost,
  hostUuid,
  vmName,
  hostName,
  vmUuid,
}) => {
  const intl = useIntl();
  const [queryData, { data: list }] = useLazyQuery(getNUMATopology, {
    variables: {
      hostUuid,
      vmUuid,
      sortByVmNode: true,
    },
  });
  useEffect(() => {
    if (visible) {
      queryData();
    }
  }, [visible]);
  const { hostTopology = [], vmTopology = [] } = list?.getNUMATopology || {};

  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph>();
  const [graphs, setGraph] = useState<any>();
  const [isFullscreen, { toggleFull }] = useFullscreen(containerRef);
  const graphData = {
    nodes: [{ id: "centerNode", x: 0, y: 0 }],
    edges: [],
  };
  const [tooltipVisible, { toggle: toggleTooltip }] = useToggle(false);
  const [tooltipX, setToolTipX] = useState<number>(0);
  const [tooltipY, setToolTipY] = useState<number>(0);
  const [percent, setPercent] = useState<number>(0);

  useEffect(() => {
    if (visible && vmTopology?.length !== 0 && hostTopology?.length !== 0) {
      const vmTopo = document.getElementById("vmTopo")!;
      const hostTopo = document.getElementById("hostTopo")!;
      const hostTopoTitle = document.getElementById("hostTopoTitle")!;
      const vmTopoTitle = document.getElementById("vmTopoTitle")!;
      let _graphs: any;
      if (!graphs) {
        _graphs = new G6.Graph({
          container: "vmTopo",
          width: containerRef.current!.clientWidth - 48,
          height: containerRef.current!.clientHeight,
          modes: {
            default: ["zoom-canvas", "drag-canvas"],
          },
          defaultNode: {
            type: "cicle",
            size: [0.001, 0.001],
          },
          maxZoom: 2,
        });
        setGraph(_graphs);
      }
      if (graphs) {
        getData(vmTopology, hostTopology, graphData, containerRef.current!);
        register(intl);

        graphRef.current = graphs;
        graphs?.data(graphData);
        graphs?.render();
        event(
          graphs,
          vmTopo,
          hostTopo,
          containerRef.current!,
          vmTopoTitle,
          hostTopoTitle,
        );
        const content = document.getElementById("container")!;
        vmTopo.style.cssText = `height:${content.clientHeight / 2}px`;
        hostTopo.style.cssText = `height:${content.clientHeight / 2}px`;
        if (vmTopology?.length < 4) {
          //初始化将图放到到画布中心
          const centerNode = graphRef.current?.findById("centerNode") ?? {
            id: "",
          };
          graphRef.current?.focusItem(centerNode);
        }
        // 展示悬浮样式，显示tooltip
        graphs?.on("node:mouseenter", (e: G6GraphEvent) => {
          const { item } = e;
          const model = item.getModel();
          if (model.type === "Ring") {
            setPercent(Math.ceil(Number(model?.percent) * 100));
            const { x = 0, y = 0 } = model;
            const point = graphs.getCanvasByPoint(x, y);
            setToolTipX(point.x);
            setToolTipY(point.y);
            toggleTooltip(true);
          }
        });
        // 去除悬浮样式，隐藏tooltip
        graphs?.on("node:mouseleave", () => {
          toggleTooltip(false);
          setPercent(0);
        });
        graphs.on("wheelzoom", () => {
          toggleTooltip(false);
        });
      }
    }
  }, [
    graphs,
    hostTopology,
    visible,
    vmTopology,
    isFullscreen,
    graphData,
    intl,
  ]);

  const bodyDom = document.querySelector("body");
  const layoutDom = document.getElementById("layout-content");

  const bodySize = useSize(bodyDom);
  const layoutSize = useSize(layoutDom);

  const fitView = () => {
    const vmTopo = document.getElementById("vmTopo")!;
    const content = document.getElementById("container")!;
    const hostTopo = document.getElementById("hostTopo")!;
    const graph = graphRef.current;
    graph?.zoomTo(1);
    const centerNode = graph?.findById("centerNode") ?? { id: "" };
    graph?.focusItem(centerNode);
    vmTopo.style.cssText = `height:${content.clientHeight / 2}px`;
    hostTopo.style.cssText = `height:${content.clientHeight / 2}px`;
  };

  //全屏
  useEffect(() => {
    const contents = document.getElementById("container")!;
    const box = containerRef.current;
    const graph = graphRef.current;
    const { width: bodyWidth = 0, height: bodyHeight = 40 } = bodySize;
    if (box && graph) {
      if (isFullscreen) {
        graph.changeSize(bodyWidth, bodyHeight);
        fitView();
      } else {
        graph.changeSize(contents.clientWidth - 48, contents.clientHeight);
        fitView();
      }
    }
  }, [isFullscreen, bodySize, layoutSize]);

  const textForZoomIn = intl.formatMessage({
    id: "zoomIn",
    defaultMessage: "Zoom in",
  });
  const textForZoomOut = intl.formatMessage({
    id: "zoomOut",
    defaultMessage: "Zoom out",
  });
  const zoom = (type: string) => {
    const vmTopo = document.getElementById("vmTopo")!;
    const content = document.getElementById("container")!;
    const hostTopo = document.getElementById("hostTopo")!;
    const graph = graphRef.current;
    hostTopo.style.cssText = `height: ${content.clientHeight / 2}px`;
    vmTopo.style.cssText = `height: ${content.clientHeight / 2}px`;
    if (type === "minimize") {
      graph?.zoom(0.8);
    } else {
      graph?.zoom(1.2);
    }
    const centerNode = graph?.findById("centerNode") ?? { id: "" };
    graph?.focusItem(centerNode);
  };
  const renderToolbar = useMemo(() => {
    const textForFitView = intl.formatMessage({
      id: "restore.canvas",
      defaultMessage: "Reset Canvas",
    });
    const textForFullscreen = isFullscreen
      ? intl.formatMessage({ id: "exitFullscreen", defaultMessage: "Exit Full Screen" })
      : intl.formatMessage({ id: "fullscreen", defaultMessage: "Full Screen" });
    const placement: TooltipPlacement = isFullscreen ? "left" : "right";
    return (
      <div className={styles.toolbar}>
        <Tooltip title={textForZoomIn} placement={placement}>
          <Button
            variant="ghost"
            className={styles.actionButton}
            onClick={() => zoom("maximize")}
            icon={<Icon type="plus" />}
          />
        </Tooltip>
        <Tooltip title={textForZoomOut} placement={placement}>
          <Button
            variant="ghost"
            className={styles.actionButton}
            onClick={() => zoom("minimize")}
            icon={<Icon type="minus" />}
          />
        </Tooltip>
        <Tooltip title={textForFitView} placement={placement}>
          <Button
            variant="ghost"
            className={styles.actionButton}
            onClick={fitView}
            icon={<Icon type="restore" />}
          />
        </Tooltip>
        <Tooltip title={textForFullscreen} placement={placement}>
          <Button
            variant="ghost"
            className={styles.actionButton}
            onClick={toggleFull}
            icon={<Icon type={isFullscreen ? "collapse" : "expand"} />}
          />
        </Tooltip>
      </div>
    );
  }, [intl, isFullscreen, toggleFull]);
  const title = useMemo(() => {
    return String(
      `${intl.formatMessage({
        id: "vm.numa.topology",
        defaultMessage: "vNUMA Topology:",
      })} ${vmName ?? ""}`,
    );
  }, [intl, vmName]);
  const titleTooltip = useMemo(() => {
    return (
      <Tooltip
        placement="right"
        title={
          <ReactMarkdown>
            {intl.formatMessage({
              id: "vm.numa.modal.title",
              defaultMessage: "***",
            })}
          </ReactMarkdown>
        }
      >
        <Icon type="info" />
      </Tooltip>
    );
  }, [intl]);
  const slideOut = () => {
    const vnumaTopo = document.getElementById("vnumaTopo")!;
    if (vnumaTopo) {
      vnumaTopo.style.cssText = `transition: 0.3s;margin-left: 110% `;
    }
  };
  const slideIn = () => {
    const vnumaTopo = document.getElementById("vnumaTopo")!;
    if (vnumaTopo) {
      vnumaTopo.style.cssText = `transition: 0.3s;margin-right: 100% `;
    }
  };
  useLayoutEffect(() => {
    slideOut();
  }, []);
  useEffect(() => {
    if (visible) {
      slideIn();
    } else {
      slideOut();
    }
  }, [visible]);
  const content = (
    <div
      id={openFromHost ? "vnumaTopo" : ""}
      className={openFromHost ? styles.vnumaTopoWrap : ""}
    >
      <div id="container" className={styles.content} ref={containerRef}>
        <div id="vmTopo" className={styles.vmTopology}>
          <Tooltip title={vmName} placement="right">
            <div className={styles.vmTopologyRight}>
              <div id="vmTopoTitle" className={styles.title}>
                vNUMA
              </div>
            </div>
          </Tooltip>
        </div>
        <div id="hostTopo" className={styles.hostTopology}>
          <Tooltip title={hostName} placement="right">
            <div id="hostTopologyLeft" className={styles.hostTopologyLeft}>
              <div id="hostTopoTitle" className={styles.title}>
                pNUMA
              </div>
            </div>
          </Tooltip>
        </div>
        <div
          className={styles.tooltip}
          style={{
            position: "absolute",
            left: tooltipX + 25,
            top: tooltipY + 20,
            display: tooltipVisible ? "block" : "none",
          }}
        >
          <div className={styles.tooltipContent}>
            <div className={styles.pointWrap}>
              <div className={styles.point} />
            </div>
            <div className={styles.text}>
              {" "}
              {intl.formatMessage({
                id: "vm.numa.modal.text.usage",
                defaultMessage: " Utilization",
              })}{" "}
            </div>
            <div className={styles.num}>{percent}%</div>
          </div>
        </div>
        {renderToolbar}
      </div>
    </div>
  );
  return openFromHost ? (
    content
  ) : (
    <DialogBase
      title={title}
      visible={visible}
      widthClassName="w-[1152px]"
      setVisible={setVisible}
      footer={null}
    >
      {titleTooltip}
      {content}
    </DialogBase>
  );
};

export default NumaTopologyModal;
