import type { TreeGraph } from "@ant-design/charts";
import { G6 } from "@ant-design/charts";
import { useQuery } from "@apollo/client";
import { Tooltip } from "@zstack/design";
import { getVirtualizationZoneRelatedSummary } from "@zstack/virtualization-resource/src/gql/zone.gql";
import { DraggableCard, useSetTab } from "@zstack/zsphere-components";
import { useSubscribeOrgTreeChange } from "@zstack/zsphere-hooks";
import { Illustrations } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type {
  VirtualizationZoneRelatedSummary as IVirtualizationZoneRelatedSummary,
  Zone,
} from "@zstack/zsphere-types/graphql";
import { getThemeColor } from "@zstack/zsphere-utils";
import React, { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const POSITION_RELATIVE_STYLE = { position: "relative" } as const;

interface IProps {
  detail: Zone;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

interface ITooltip {
  title: string;
  x: number;
  y: number;
  open: boolean;
}

const resourceTypeList = [
  "VmInstance",
  "Cluster",
  "HostVO",
  "PrimaryStorageVO",
  "BackupStorage",
  "RemoteBackupStorage",
  "L2Network",
  "L3Network",
];

const Topo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { themeConfig } = usePlatformStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<TreeGraph | null>(null);
  const [tooltip, setTooltip] = useState<ITooltip>({
    title: "",
    x: 0,
    y: 0,
    open: false,
  });

  const { setTab, setTabMultiple } = useSetTab();
  const {
    data,
    refetch,
    loading: _loading,
  } = useQuery<{
    getVirtualizationZoneRelatedSummary: IVirtualizationZoneRelatedSummary;
  }>(getVirtualizationZoneRelatedSummary, {
    variables: { uuid: detail?.uuid },
    fetchPolicy: "network-only",
  });

  const summary = data?.getVirtualizationZoneRelatedSummary ?? {};

  useSubscribeOrgTreeChange({
    resourceTypeList,
    onFinish: (e: any) => {
      if (e.state === "success") {
        refetch();
      }
    },
  });

  const fittingString = (str: string, maxWidth: number, fontSize: number) => {
    const ellipsis = "...";
    const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
    let currentWidth = 0;
    let res = str;
    const pattern = new RegExp("[\u4E00-\u9FA5]+"); // distinguish the Chinese charactors and letters

    str.split("").forEach((letter, i) => {
      if (currentWidth > maxWidth - ellipsisLength) {
        return;
      }
      if (pattern.test(letter)) {
        // Chinese charactors
        currentWidth += fontSize;
      } else {
        // get the width of single letter according to the fontSize
        currentWidth += G6.Util.getLetterWidth(letter, fontSize);
      }
      if (currentWidth > maxWidth - ellipsisLength) {
        res = `${str.substr(0, i)}${ellipsis}`;
      }
    });
    return res;
  };

  useEffect(() => {
    const themeColor600 = getThemeColor(
      themeConfig?.themeColor ?? "blue",
      themeConfig?.themeMode ?? "light",
      600,
    );
    if (typeof summary.virPrimaryStorageCount === "number") {
      if (containerRef.current) {
        graphRef.current?.destroy();
      }
      const topoData = {
        id: "zone",
        img: Illustrations["3d-building"],
        value: {
          name: intl.formatMessage({
            id: "virtualization.zone",
            defaultMessage: "Data Center",
          }),
          detail: detail?.name,
        },
        children: [
          {
            id: "cluster",
            img: Illustrations["3d-cluster"],
            value: {
              name: intl.formatMessage({
                id: "virtualization.cluster",
                defaultMessage: "Cluster",
              }),
              detail: summary?.virClusterCount,
              tabKeys: ["cluster.and.host", "cluster"],
            },
            children: [
              {
                id: "host",
                img: Illustrations["3d-server"],
                value: {
                  name: intl.formatMessage({
                    id: "virtualization.host",
                    defaultMessage: "Host",
                  }),
                  detail: summary?.virHostCount,
                  tabKeys: ["cluster.and.host", "host"],
                },
                children: [
                  {
                    id: "vm",
                    img: Illustrations["3d-computer"],
                    value: {
                      name: intl.formatMessage({
                        id: "virtualization.vm",
                        defaultMessage: "Virtual Machine",
                      }),
                      detail: summary?.virInstanceCount,
                      tabKeys: ["virtual.instance"],
                    },
                  },
                ],
              },
              {
                id: "l2",
                img: Illustrations["3d-distributedswitch"],
                value: {
                  name: intl.formatMessage({
                    id: "virtualization.l2",
                    defaultMessage: "Distributed Switch",
                  }),
                  detail: summary?.virL2NetworkCount,
                  tabKeys: ["network", "l2"],
                },
                children: [
                  {
                    id: "l3",
                    img: Illustrations["3d-distributedportgroup"],
                    value: {
                      name: intl.formatMessage({
                        id: "virtualization.l3",
                        defaultMessage: "Distributed Port Group",
                      }),
                      detail: summary?.virL3NetworkCount,
                      tabKeys: ["network", "l3"],
                    },
                  },
                ],
              },
              {
                id: "dataStore",
                img: Illustrations["3d-server-datastorage"],
                value: {
                  name: intl.formatMessage({
                    id: "virtualization.ps",
                    defaultMessage: "Data Storage",
                  }),
                  detail: summary?.virPrimaryStorageCount,
                  tabKeys: ["dataStore"],
                },
              },
            ],
          },
          {
            id: "imageStore",
            img: Illustrations["3d-server-imagestorage"],
            value: {
              name: intl.formatMessage({
                id: "virtualization.bs",
                defaultMessage: "Image Storage",
              }),
              detail: summary?.virImageStoreCount,
              tabKeys: ["imageStore"],
            },
          },
        ],
      };
      G6.registerNode(
        "icon-node",
        {
          options: {
            size: [60, 20],
            stroke: "#91d5ff",
            fill: "#91d5ff",
          },
          draw(cfg: any, group) {
            const { labelCfg = {}, img } = cfg;
            let attrs = {};
            if (cfg.id === "zone") {
              attrs = {
                x: 128,
                y: 96,
                width: 128,
                height: 60,
                // fill: '#3EA1FA'
              };
            } else if (["imageStore", "cluster"].indexOf(cfg.id) !== -1) {
              attrs = {
                x: 128,
                y: 96,
                width: 112,
                height: 60,
                //   fill: '#3EA1FA'
              };
            } else if (cfg.id === "host") {
              attrs = {
                x: 128,
                y: 96,
                width: 96,
                height: 60,
                //   fill: '#3EA1FA'
              };
            } else if (cfg.id === "l2") {
              attrs = {
                x: 128,
                y: 96,
                width: 152,
                height: 60,
                //   fill: '#3EA1FA'
              };
            } else {
              attrs = {
                x: 128,
                y: 96,
                width: 152,
                height: 60,
                //   fill: '#3EA1FA'
              };
            }

            const keyShape = group.addShape("rect", {
              attrs,
            });

            group.addShape("image", {
              id: "img",
              attrs: {
                x: 128,
                y: 96,
                width: 60,
                height: 60,
                img,
                cursor:
                  cfg.value?.tabKeys && cfg.value?.detail > 0
                    ? "pointer"
                    : "default",
              },
            });

            if (cfg.value && cfg.value?.name) {
              group.addShape("text", {
                id: "name",
                attrs: {
                  ...labelCfg.style,
                  text: fittingString(`${cfg.value?.name || 0}`, 120, 12),
                  textAlign: "left",
                  textBaseline: "middle",
                  fill: "#707275",
                  fontSize: 14,
                  x: 196,
                  y: 116,
                  cursor:
                    cfg.value.tabKeys && cfg.value.detail > 0
                      ? "pointer"
                      : "default",
                },
              });
              group.addShape("text", {
                id: "detail",
                attrs: {
                  ...labelCfg.style,
                  text: fittingString(
                    `${cfg.value?.detail || 0}`,
                    cfg.id === "zone" ? 50 : 120,
                    12,
                  ),
                  textAlign: "left",
                  textBaseline: "middle",
                  fontSize: 16,
                  x: 196,
                  y: 140,
                  cursor:
                    cfg.value.tabKeys && cfg.value.detail > 0
                      ? "pointer"
                      : "default",
                },
              });
            }

            return keyShape;
          },
          update: undefined,
          setState(name, value, item) {
            const nodeData = item?.getModel().value as any;
            if (!nodeData?.tabKeys || nodeData.detail <= 0) {
              return;
            }
            const group = item?.getContainer();
            const nameText = group?.findById("name");
            const detailText = group?.findById("detail");
            if (value) {
              nameText?.attr("fill", themeColor600);
              detailText?.attr("fill", themeColor600);
            } else {
              nameText?.attr("fill", defaultLabelCfg.style.color);
              detailText?.attr("fill", "black");
            }
          },
        },
        "rect",
      );

      G6.registerEdge("flow-line", {
        draw(cfg: any, group) {
          const startNode = cfg?.sourceNode?._cfg;
          const endNode = cfg?.targetNode?._cfg;
          // console.log(startNode, 'startNode')
          // console.log(endNode, 'endNode')
          const startPoint = cfg.startPoint as any;
          const endPoint = cfg.endPoint as any;
          let path = [
            ["M", startPoint.x + 70, startPoint.y],
            ["L", (startPoint.x + endPoint.x) / 2, startPoint.y],
            ["L", (startPoint.x + endPoint.x) / 2, endPoint.y],
            ["L", endPoint.x - 70, endPoint.y],
          ];

          if (
            startNode.id === "l2" ||
            (startNode.id === "host" && endNode.id === "vm")
          ) {
            path = [
              ["M", startPoint.x + 80, startPoint.y],
              ["L", endPoint.x - 90, endPoint.y],
            ];
          }

          if (startNode.id === "cluster" && endNode.id === "host") {
            path = [
              ["M", startPoint.x + 50, startPoint.y],
              ["L", (startPoint.x + endPoint.x) / 2 + 14, startPoint.y],
              ["L", (startPoint.x + endPoint.x) / 2 + 14, endPoint.y],
              ["L", endPoint.x, endPoint.y],
            ];
          }
          if (startNode.id === "cluster" && endNode.id === "l2") {
            path = [
              ["M", startPoint.x + 80, startPoint.y],
              ["L", (startPoint.x + endPoint.x) / 2, startPoint.y],
              ["L", (startPoint.x + endPoint.x) / 2, endPoint.y],
              ["L", endPoint.x - 50, endPoint.y],
            ];
          }
          const { style } = cfg;
          const shape = group.addShape("path", {
            attrs: {
              stroke: style?.stroke,
              path,
            },
          });

          return shape;
        },
      });

      const defaultStateStyles = {
        hover: {
          stroke: "#1890ff",
          lineWidth: 2,
        },
      };

      const defaultNodeStyle = {
        fill: "#0f4868",
        stroke: "#40a9ff",
        radius: 10,
      };

      const defaultEdgeStyle = {
        stroke: "#C8CACD",
      };

      const defaultLayout = {
        type: "compactBox",
        direction: "LR",
        getId: function getId(d: any) {
          return d.id;
        },
        //每个节点高度
        getHeight: function getHeight(_d: any) {
          return 60;
        },
        //每个节点宽度
        getWidth: function getWidth(d: any) {
          if (["dataStore", "host"].indexOf(d.id) !== -1) {
            return 96;
          }
          if (["l2", "l3"].indexOf(d.id) !== -1) {
            return 168;
          }
          if (["cluster", "imageStore"].indexOf(d.id) !== -1) {
            return 104;
          }
          return 104;
        },
        //纵向间隔
        getVGap: function getVGap(d: any) {
          if (["dataStore", "host", "l2", "l3", "vm"].indexOf(d.id) !== -1) {
            return 8;
          }

          if (d.id === "instance") {
            return 8;
          }

          if (d.id === "imageStore") {
            return 20;
          }

          return 40;
        },
        //横向间隔
        getHGap: function getHGap(d: any) {
          if (["l3", "vm"].indexOf(d.id) !== -1) {
            return 30;
          }
          if (["cluster", "imageStore"].indexOf(d.id) !== -1) {
            return 34;
          }
          return 34;
        },
      };

      const defaultLabelCfg = {
        position: "left",
        style: {
          fill: "black",
          fontSize: 14,
          color: "#707275",
        },
      };

      const card = document.getElementById("data-center-topo-card") as any;
      const width = card.scrollWidth;
      const height = 280;
      const grid = new G6.Grid();
      if (!containerRef.current) {
        return;
      }
      const graph = new G6.TreeGraph({
        container: containerRef.current,
        width,
        height,
        linkCenter: true,
        plugins: [grid],
        fitCenter: true,
        animate: false,
        modes: {
          default: ["drag-canvas"],
        },
        defaultNode: {
          type: "icon-node",
          size: [120, 40],
          style: defaultNodeStyle,
          labelCfg: defaultLabelCfg,
        },
        defaultEdge: {
          type: "flow-line",
          style: defaultEdgeStyle,
        },
        nodeStateStyles: defaultStateStyles,
        edgeStateStyles: defaultStateStyles,
        layout: defaultLayout,
      });

      const handleResize = () => {
        graph.changeSize(containerRef?.current?.clientWidth as number, height);
      };

      window.addEventListener("resize", handleResize);

      graph.on("node:mouseenter", ({ item }) => {
        graph.setItemState(item!, "hover", true);
        const { id, value } = item?.get("model") ?? {};
        const detailText = item?.getContainer()?.findById("detail");
        const title = `${value?.detail || 0}`;
        const content = fittingString(title, id === "zone" ? 50 : 120, 12);
        if (detailText && content.endsWith("...")) {
          const box = detailText.getCanvasBBox();
          const x = box.x + box.width / 2;
          const y = box.y;
          setTooltip({ title, x, y, open: true });
        }
      });

      graph.on("node:mouseleave", ({ item }) => {
        graph.setItemState(item!, "hover", false);
        setTooltip((prev) => ({ ...prev, open: false }));
      });

      graph.on("node:click", ({ item }) => {
        const value = item?.getModel().value as any;
        if (!value || !value.tabKeys || value.detail <= 0) {
          return;
        }
        if (value.tabKeys[1]) {
          const tabKey = value.tabKeys[1];
          if (tabKey === "cluster" || tabKey === "host") {
            setTabMultiple([
              {
                contentId: "main-tab",
                newKey: "cluster.and.host",
              },
              {
                contentId: "cluster-host",
                newKey: tabKey,
              },
            ]);
            return;
          }
          if (tabKey === "l2" || tabKey === "l3") {
            setTabMultiple([
              {
                contentId: "main-tab",
                newKey: "network",
              },
              {
                contentId: "network",
                newKey: tabKey,
              },
            ]);
            return;
          }
        }
        if (
          ["imageStore", "dataStore", "virtual.instance"].indexOf(
            value.tabKeys[0],
          ) !== -1
        ) {
          setTab("main-tab", value.tabKeys[0]);
        }
      });

      graph.data(topoData);
      graph.render();
      graph.fitView();
      graphRef.current = graph;

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [summary, containerRef, detail, themeConfig]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "virtualization.dataCenter.overview.topo",
        defaultMessage: "Resource Topology",
      })}
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
      id="data-center-topo-card"
      className={styles["data-center-topo-card"]}
    >
      <div style={POSITION_RELATIVE_STYLE}>
        <Tooltip placement="top" title={tooltip.title} open={tooltip.open}>
          <div
            style={{ position: "absolute", top: tooltip.y, left: tooltip.x }}
          />
        </Tooltip>
      </div>
      <div ref={containerRef} className={styles.graph} />
    </DraggableCard>
  );
};

export default Topo;
