import { G6 } from "@ant-design/charts";
import { Illustrations } from "@zstack/zsphere-illustration";
import {
  getNeutralColor,
  getThemeColor,
  beautyStr,
} from "@zstack/zsphere-utils";
import { forIn, isArray, get } from "lodash-es";

import type { IModelConfig, ShapeAttrs } from "./type";

//  导入 svg
const vmIcon = Illustrations["3d-computer"];
const l2Icon = Illustrations["3d-distributedswitch"];
const l3Icon = Illustrations["3d-distributedportgroup"];
const clusterIcon = Illustrations["3d-cluster"];
const hostIcon = Illustrations["3d-server"];

const mode = "light";
const blue600 = getThemeColor("blue", mode, 600);
const red500 = getThemeColor("red", mode, 500);
const neutral700 = getNeutralColor(mode, 700);
const neutral500 = getNeutralColor(mode, 500);
const neutral400 = getNeutralColor(mode, 400);
const neutral300 = getNeutralColor(mode, 300);
const lineDefaultColor = getNeutralColor(mode, 300);
const lineHighlightColor = getThemeColor("blue", mode, 400);
const lineHighlightShadowColor = getThemeColor("blue", mode, 200);
const lineErrorColor = getThemeColor("red", mode, 300);
const lineErrorShadowColor = getThemeColor("red", mode, 200);

// https://g6.antv.antgroup.com/api/register-item
export const registerNode = () => {
  const defaultBoxAttrs: ShapeAttrs = {
    x: 0,
    y: 0,
    width: 44,
    height: 44,
  };
  const defaultIconAttrs: ShapeAttrs = {
    x: 0,
    y: 0,
    // svg 默认都是 200*200
    width: 200,
    height: 200,
    cursor: "pointer",
  };
  const defaultTitleAttrs: ShapeAttrs = {
    fontSize: 14,
    lineHeight: 22,
    fill: neutral700,
    textBaseline: "middle",
    cursor: "pointer",
  };

  G6.registerNode("resource-node", {
    draw: (cfg: any, group: any) => {
      const { value = {}, resourceType, detail, style } = cfg;
      const noneText = style?.noneText || "None";

      let boxAttrs: ShapeAttrs = {};
      let iconAttrs: ShapeAttrs = {};
      let titleAttrs: ShapeAttrs = {};
      const beautyTitle = beautyStr(value.title, 8);

      switch (resourceType) {
        case "host":
          boxAttrs = {
            width: 33,
          };
          iconAttrs = {
            img: hostIcon,
            width: 44,
            height: 44,
          };
          titleAttrs = {
            text: beautyTitle,
            x: -5,
            y: 22,
            textAlign: "right",
          };
          if ((detail as any)?.status === "Disconnected") {
            titleAttrs.fill = red500;
          }
          break;
        case "cluster":
          boxAttrs = {
            width: 66,
          };
          iconAttrs = {
            img: clusterIcon,
            x: 30,
            width: 44,
            height: 44,
          };
          titleAttrs = {
            text: beautyTitle,
            x: 53,
            y: 44 + 10,
            textAlign: "center",
          };
          break;
        case "l2":
          boxAttrs = {
            width: 44 - 6,
          };
          iconAttrs = {
            img: l2Icon,
            x: -3,
            y: -5,
            width: 44,
            height: 44,
          };
          titleAttrs = {
            text: beautyTitle,
            x: 22,
            y: 34 + 10,
            textAlign: "center",
          };
          break;
        case "l3":
          boxAttrs = {
            width: 82,
          };
          iconAttrs = {
            img: l3Icon,
            x: -3,
            y: 0,
            width: 44,
            height: 44,
          };
          titleAttrs = {
            text: beautyTitle,
            x: 22,
            y: 42,
            textAlign: "center",
          };
          break;
        case "vm":
          boxAttrs = {
            width: 34 - 2,
          };
          iconAttrs = {
            img: vmIcon,
            x: -2,
            y: 6,
            width: 34,
            height: 34,
          };
          titleAttrs = {
            text: beautyTitle,
            x: 34 + 6,
            y: 22,
            textAlign: "left",
          };
          break;
        default:
          break;
      }
      const shape = group.addShape("rect", {
        attrs: {
          ...defaultBoxAttrs,
          ...boxAttrs,
        },
        name: "main-box",
      });
      group.addShape("image", {
        attrs: {
          ...defaultIconAttrs,
          ...iconAttrs,
        },
        name: "icon",
      });
      group.addShape("text", {
        attrs: {
          ...defaultTitleAttrs,
          ...titleAttrs,
        },
        name: "title",
      });
      if (resourceType === "cluster") {
        const hostCount = (detail as any)?.hostCount;
        if (hostCount) {
          const textLength = String(hostCount).length;
          const distance = (textLength - 1) * 4;
          const countIconGroup = group.addGroup({
            name: "countIcon",
            capture: false,
          });
          countIconGroup.addShape("rect", {
            attrs: {
              x: 13 - distance,
              y: 13,
              width: 21 + distance,
              height: 18,
              radius: 8,
              fill: neutral300,
            },
            name: "countRect",
          });
          countIconGroup.addShape("text", {
            attrs: {
              text: hostCount,
              x: 20 - distance,
              y: 22,
              fontSize: 12,
              lineHeight: 20,
              fill: neutral700,
              textBaseline: "middle",
            },
            name: "countText",
          });

          const collapseBtnGroup = group.addGroup({
            name: "collapseBtn",
          });
          collapseBtnGroup.addShape("circle", {
            attrs: {
              x: -distance,
              y: 22,
              r: 8,
              cursor: "pointer",
              fill: "white",
              stroke: neutral400,
            },
            name: "collapseCircle",
          });
          collapseBtnGroup.addShape("text", {
            attrs: {
              text: "-",
              x: -4 - distance,
              y: 21,
              fontSize: 14,
              lineHeight: 16,
              cursor: "pointer",
              fill: neutral700,
              textBaseline: "middle",
            },
            name: "collapseText",
          });
        }
      }
      if (resourceType === "l3") {
        const vlanId = detail?.vlanId || noneText;
        group.addShape("text", {
          attrs: {
            text: `VLAN ID: ${vlanId}`,
            x: 22,
            y: 58,
            textAlign: "center",
            fontSize: 12,
            lineHeight: 20,
            fill: neutral500,
            textBaseline: "middle",
          },
          name: "vlanId",
        });

        const vmCount = (detail as any)?.vmCount;
        if (vmCount) {
          const textLength = String(vmCount).length;
          const distance = (textLength - 1) * 4;
          const countIconGroup = group.addGroup({
            name: "countIcon",
            capture: false,
          });
          countIconGroup.addShape("rect", {
            attrs: {
              x: 45,
              y: 13,
              width: 21 + distance,
              height: 18,
              radius: 8,
              fill: neutral300,
            },
          });
          countIconGroup.addShape("text", {
            attrs: {
              text: vmCount,
              x: 45 + 7,
              y: 22,
              fontSize: 12,
              lineHeight: 20,
              fill: neutral700,
              textBaseline: "middle",
            },
          });

          const collapseBtnGroup = group.addGroup({
            name: "collapseBtn",
          });
          collapseBtnGroup.addShape("circle", {
            attrs: {
              x: 80 + distance,
              y: 22,
              r: 8,
              cursor: "pointer",
              fill: "white",
              stroke: neutral400,
            },
            name: "collapseCircle",
          });
          collapseBtnGroup.addShape("text", {
            attrs: {
              text: "-",
              x: 76 + distance,
              y: 21,
              fontSize: 14,
              lineHeight: 16,
              cursor: "pointer",
              fill: neutral700,
              textBaseline: "middle",
            },
            name: "collapseText",
          });
        }
      }
      return shape;
    },
    getAnchorPoints() {
      return [
        [0, 0.5],
        [1, 0.5],
      ];
    },
    setState(name, value, item) {
      const group = item?.getContainer();
      const model = item?.getModel() as any;
      if (group && model) {
        if (name === "active") {
          if (
            model.resourceType === "host" &&
            (model.detail as any)?.status === "Disconnected"
          ) {
            return;
          }
          const textShape = group.getChildByIndex(2);
          const textColor = value ? blue600 : neutral700;
          textShape?.attr({ fill: textColor });
        }

        if (name === "childrenCollapsed") {
          const collapseTextShape = group.find(
            (ele) => ele.cfg.name === "collapseText",
          );
          collapseTextShape?.attr({ text: value ? "+" : "-" });
        }
      }
    },
  });
};

export const registerEdge = () => {
  G6.registerEdge("resource-edge", {
    draw(cfg: any, group: any) {
      const { startPoint, endPoint, sourceNode, targetNode } = cfg;
      const sourceModel = get(sourceNode, "_cfg.model") as IModelConfig;
      const targetModel = get(targetNode, "_cfg.model") as IModelConfig;

      const { x: startX = 0, y: startY = 0 } = startPoint || {};
      const { x: endX = 0, y: endY = 0 } = endPoint || {};
      // 计算中间控制点
      const controlDistance = (3 * (endX - startX)) / 5;
      const controlPoint1 = {
        x: startX + controlDistance,
        y: startY,
      };

      const controlPoint2 = {
        x: endX - controlDistance,
        y: endY,
      };

      // 延长线
      const extendPoint1 = {
        x: startX,
        y: startY,
      };
      const extendPoint2 = {
        x: endX,
        y: endY,
      };

      if (
        sourceModel.resourceType === "cluster" &&
        sourceModel.relations?.host?.length
      ) {
        extendPoint1.x = startX - 70;
      }

      if (
        targetModel.resourceType === "l3" &&
        targetModel.relations?.vm?.length
      ) {
        extendPoint2.x = endX + 75;
      }

      let stroke = lineDefaultColor;
      let highlightStroke = lineHighlightColor;
      let shadowStroke = lineHighlightShadowColor;
      let lineDash: number[] | null = null;
      if (
        sourceModel.resourceType === "host" &&
        (sourceModel.detail as any)?.status === "Disconnected"
      ) {
        stroke = lineErrorColor;
        highlightStroke = lineErrorColor;
        shadowStroke = lineErrorShadowColor;
        lineDash = [4, 3];
      }

      const path = [
        ["M", extendPoint1.x, extendPoint1.y],
        ["L", startX, startY],
        [
          "C",
          controlPoint1.x,
          controlPoint1.y,
          controlPoint2.x,
          controlPoint2.y,
          endX,
          endY,
        ],
        ["L", extendPoint2.x, extendPoint2.y],
      ];
      const shape = group.addShape("path", {
        attrs: {
          path,
          stroke,
          lineDash,
          lineWidth: 2,
        },
        name: "path-shape",
      });
      group.addShape("path", {
        attrs: {
          path,
          stroke: highlightStroke,
          opacity: 0,
          lineDash,
          lineWidth: 2,
        },
        name: "path-highlight-shape",
      });
      group.addShape("path", {
        attrs: {
          path,
          stroke: shadowStroke,
          opacity: 0,
          lineWidth: 6,
        },
        name: "path-shadow-shape",
      });
      return shape;
    },
    setState(name, value, item) {
      const group = item?.getContainer();
      if (group && name === "active") {
        const shapes = group.getChildren();
        shapes.forEach((shape) => {
          if (shape.cfg.name === "path-shape") {
            shape.attr({
              opacity: value ? 0 : 1,
            });
          }
          if (shape.cfg.name === "path-highlight-shape") {
            shape.attr({
              opacity: value ? 1 : 0,
            });
          }
          if (shape.cfg.name === "path-shadow-shape") {
            shape.attr({
              opacity: value ? 0.5 : 0,
            });
          }
        });
        item?.toFront();
      }
    },
  });
};

// https://g6.antv.antgroup.com/api/behavior
export const registerBehavior = () => {
  G6.registerBehavior("highlight", {
    getDefaultCfg() {
      return {};
    },
    getEvents() {
      return {
        "node:click": "onNodeClick",
        "canvas:click": "onCanvasClick",
      };
    },
    onNodeClick(e: any) {
      const targetName = e.target.cfg.name;
      const graph = this.graph as any;
      const node = e.item;
      if (!node) {
        return;
      }
      const model = node.getModel() as any;
      const { id, resourceType, relations } = model;

      if (["title", "icon"].includes(targetName)) {
        // 清除所有节点状态
        (this.clearItemState as (fn: () => void) => void)(() => {
          // 交换机没有点击效果
          if (resourceType === "l2" || !relations) {
            return;
          }
          // 高亮当前节点
          graph.setItemState(node, "active", true);
          // 高亮关联节点
          forIn(relations, (nodeIdList) => {
            if (isArray(nodeIdList)) {
              nodeIdList?.forEach((nodeId) => {
                const targetNode = graph.findById(nodeId);
                if (targetNode) {
                  graph.setItemState(targetNode, "active", true);
                }
              });
            }
          });
          const relationEdges: string[] = [];
          relations.host?.forEach((hostId: any) => {
            if (resourceType === "cluster") {
              relationEdges.push(`${hostId}-${id}`);
            } else {
              relations.cluster?.forEach((clusterId: any) => {
                relationEdges.push(`${hostId}-${clusterId}`);
              });
            }
          });
          relations.cluster?.forEach((clusterId: any) => {
            if (resourceType === "host") {
              relationEdges.push(`${id}-${clusterId}`);
            }
            relations.l2?.forEach((l2Id: any) => {
              relationEdges.push(`${clusterId}-${l2Id}`);
            });
          });
          relations.l2?.forEach((l2Id: any) => {
            if (resourceType === "cluster") {
              relationEdges.push(`${id}-${l2Id}`);
            }
            if (resourceType === "l3") {
              relationEdges.push(`${l2Id}-${id}`);
            } else {
              relations.l3?.forEach((l3Id: any) => {
                relationEdges.push(`${l2Id}-${l3Id}`);
              });
            }
          });
          relations.l3?.forEach((l3Id: any) => {
            if (resourceType === "vm") {
              relationEdges.push(`${l3Id}-${id}`);
            } else {
              relations.vm?.forEach((vmId: any) => {
                relationEdges.push(`${l3Id}-${vmId}`);
              });
            }
          });
          if (resourceType === "l3") {
            relations.vm?.forEach((vmId: any) => {
              relationEdges.push(`${id}-${vmId}`);
            });
          }
          // 高亮关联连线
          graph.getEdges().forEach((edge: any) => {
            const sourceId = edge.getSource().getID();
            const targetId = edge.getTarget().getID();
            const edgeName = `${sourceId}-${targetId}`;
            if (relationEdges.includes(edgeName)) {
              graph.setItemState(edge, "active", true);
            }
          });
        });
      }
      if (
        ["collapseText", "collapseCircle"].includes(targetName) &&
        relations
      ) {
        const currentStates = node.getStates();
        const isChildrenCollapsed = currentStates.includes("childrenCollapsed");
        graph.setItemState(node, "childrenCollapsed", !isChildrenCollapsed);
        if (resourceType === "l3") {
          relations.vm?.forEach((vmId: any) => {
            if (isChildrenCollapsed) {
              graph.showItem(vmId);
            } else {
              graph.hideItem(vmId);
            }
          });
        }
        if (resourceType === "cluster") {
          relations.host?.forEach((hostId: any) => {
            if (isChildrenCollapsed) {
              graph.showItem(hostId);
            } else {
              graph.hideItem(hostId);
            }
          });
        }
      }
    },
    onCanvasClick(e: any) {
      // shouldUpdate 可以由用户复写，返回 true 时取消所有节点的 'active' 状态，即将 'active' 状态置为 false
      if (this.shouldUpdate?.(e)) {
        (this.clearItemState as () => void)();
      }
    },
    clearItemState(fn?: () => void) {
      const graph = this.graph as any;
      graph.setAutoPaint(false);
      graph.findAllByState("node", "active").forEach((item: any) => {
        graph.setItemState(item, "active", false);
      });
      graph.findAllByState("edge", "active").forEach((item: any) => {
        graph.setItemState(item, "active", false);
      });
      fn?.();
      graph.paint();
      graph.setAutoPaint(true);
    },
  });
};
