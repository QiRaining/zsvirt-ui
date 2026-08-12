import type { IGroup } from "@antv/g-base/lib/interfaces";
import G6 from "@antv/g6";
import {
  Rect,
  Text,
  Group,
  Circle,
  createNodeFromReact,
} from "@antv/g6-react-node";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";

// Style constants
const TAG_STYLE = { fill: "#fff", fontSize: 12 } as const;
const TAG_LABEL_TEXT_STYLE = {
  fill: "#4A4C4F",
  fontWeight: 400,
  fontSize: 12,
} as const;
const TAG_CONTAINER_STYLE = {
  fill: "#fff",
  margin: [2, 2],
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 28,
  height: 28,
  radius: [2, 2],
} as const;
const CARD1_HEADER_STYLE = {
  width: 212,
  fill: "#F0F2F5",
  radius: [8, 8, 0, 0],
  padding: 8,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
} as const;
const CARD1_MIDDLE_STYLE = {
  width: 212,
  height: 20,
  padding: [0, 12],
  display: "flex",
  flexDirection: "row",
  fill: "#F0F2F5",
} as const;
const CARD1_LABEL_LEFT_STYLE = { width: 84, height: 20 } as const;
const CARD1_LABEL_RIGHT_STYLE = {
  width: 80,
  height: 20,
  padding: [0, 0, 0, 10],
} as const;
const CARD1_LABEL_VALUE_STYLE = {
  fill: "#707275",
  fontWeight: 400,
  fontSize: 12,
} as const;
const CARD1_BUTTON_STYLE = {
  width: 212,
  height: 32,
  fill: "#3EA1FA",
  radius: [0, 0, 8, 8],
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: [5, 50],
} as const;
const CARD1_BUTTON_RECT_STYLE = { width: "auto" } as const;
const CARD1_CIRCLE_CONTAINER_STYLE = {
  width: 212,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 1,
} as const;
const CARD1_CIRCLE_STYLE = {
  x: 0,
  y: 0,
  r: 7,
  lineWidth: "1.5",
  stroke: "#96989B",
} as const;
const CARD2_CIRCLE_CONTAINER_STYLE = {
  width: 212,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: 1,
} as const;
const CARD2_CIRCLE_STYLE = {
  x: 0,
  y: 0,
  r: 7,
  lineWidth: "1.5",
  stroke: "#96989B",
} as const;
const CARD2_HEADER_STYLE = {
  width: "auto",
  height: 32,
  fill: "#4A4C4F",
  radius: [8, 8, 0, 0],
  justifyContent: "center",
  alignItems: "center",
} as const;
const CARD2_BODY_STYLE = {
  width: 212,
  height: 48,
  fill: "#fff",
  padding: 12,
} as const;
const CARD2_BODY_ROW_STYLE = {
  width: 140,
  height: 20,
  display: "flex",
  flexDirection: "row",
} as const;
const CARD2_LABEL_LEFT_STYLE = { width: 74, height: 20 } as const;
const CARD2_LABEL_RIGHT_STYLE = {
  width: 74,
  height: 20,
  padding: [0, 0, 0, 10],
} as const;
const CARD2_LABEL_VALUE_STYLE = {
  fill: "#707275",
  fontWeight: 400,
  fontSize: 12,
} as const;
const CARD2_FOOTER_STYLE = {
  width: 212,
  fill: "#fff",
  radius: [0, 0, 8, 8],
  padding: 8,
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
} as const;
const ANCHOR_STYLE = {
  width: 20,
  height: 10,
  fill: "#3EA1FA",
  stroke: "#3EA1FA",
} as const;

const register = (intl: any) => {
  const Tag = ({ text, color }: any) => (
    <Rect
      style={{
        fill: color,
        margin: [2, 2],
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 28,
        height: 28,
        radius: [2, 2],
      }}
    >
      <Text
        style={{
          fill: "#4A4C4F",
          fontSize: 12,
        }}
      >
        {text}
      </Text>
    </Rect>
  );

  const Card1 = ({ cfg }: any) => {
    return (
      <Group>
        <Rect
          style={{
            width: 212,
            fill: "#F0F2F5",
            radius: [8, 8, 0, 0],
            padding: 8,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {cfg.tags.map((item: string) => (
            <Tag key={item} color="#FFFFFF" text={item} />
          ))}
        </Rect>
        <Rect
          style={{
            width: 212,
            height: 20,
            padding: [0, 12],
            display: "flex",
            flexDirection: "row",
            fill: "#F0F2F5",
          }}
        >
          <Rect
            style={{
              width: 84,
              height: 20,
            }}
          >
            <Text style={{ fill: "#707275", fontWeight: 400, fontSize: 12 }}>
              {intl.formatMessage({
                id: "total.memorySize",
                defaultMessage: "Total Memory",
              })}{" "}
              :
            </Text>
          </Rect>
          <Rect
            style={{
              width: 80,
              height: 20,
              padding: [0, 0, 0, 10],
            }}
          >
            <Text style={{ fill: "#4A4C4F", fontWeight: 400, fontSize: 12 }}>
              {formatStorage(cfg?.memSize, 2)}{" "}
            </Text>
          </Rect>
        </Rect>
        <Rect
          style={{
            width: 212,
            height: 32,
            fill: "#3EA1FA",
            radius: [0, 0, 8, 8],
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: [5, 50],
          }}
        >
          <Rect style={{ width: "auto" }}>
            <Text style={{ fill: "#fff", fontSize: 12 }}>{cfg.label}</Text>
          </Rect>
        </Rect>
        <Rect
          style={{
            width: 212,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 1,
          }}
        >
          <Circle
            style={{
              x: 0,
              y: 0,
              r: 7,
              lineWidth: "1.5",
              stroke: "#96989B",
            }}
          />
        </Rect>
      </Group>
    );
  };

  const Card2 = ({ cfg }: any) => {
    return (
      <Group>
        <Rect
          style={{
            width: 212,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 1,
          }}
        >
          <Circle
            style={{
              x: 0,
              y: 0,
              r: 7,
              lineWidth: "1.5",
              stroke: "#96989B",
            }}
          />
        </Rect>
        <Rect
          style={{
            width: "auto",
            height: 32,
            fill: "#4A4C4F",
            radius: [8, 8, 0, 0],
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Rect style={{ width: "auto" }}>
            <Text style={{ fill: "#fff", fontSize: 12 }}>{cfg.label}</Text>
          </Rect>
        </Rect>
        <Rect
          style={{
            width: 212,
            height: 48,
            fill: "#fff",
            padding: 12,
          }}
        >
          <Rect
            style={{
              width: 140,
              height: 20,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Rect
              style={{
                width: 74,
                height: 20,
              }}
            >
              <Text style={{ fill: "#707275", fontWeight: 400, fontSize: 12 }}>
                {intl.formatMessage({
                  id: "total.memorySize",
                  defaultMessage: "Total Memory",
                })}{" "}
                :
              </Text>
            </Rect>
            <Rect
              style={{
                width: 74,
                height: 20,
                padding: [0, 0, 0, 10],
              }}
            >
              <Text style={{ fill: "#4A4C4F", fontWeight: 400, fontSize: 12 }}>
                {formatStorage(cfg?.total, 2)}
              </Text>
            </Rect>
          </Rect>
          <Rect
            style={{
              width: 140,
              height: 20,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Rect
              style={{
                width: 74,
                height: 20,
              }}
            >
              <Text style={{ fill: "#707275", fontWeight: 400, fontSize: 12 }}>
                {intl.formatMessage({
                  id: "free.memorysizes",
                  defaultMessage: "Free Memory",
                })}{" "}
                :
              </Text>
            </Rect>
            <Rect
              style={{
                width: 74,
                height: 20,
                padding: [0, 0, 0, 10],
              }}
            >
              <Text style={{ fill: "#4A4C4F", fontWeight: 400, fontSize: 12 }}>
                {formatStorage(cfg?.free, 2)}
              </Text>
            </Rect>
          </Rect>
        </Rect>
        <Rect
          style={{
            width: 212,
            fill: "#fff",
            radius: [0, 0, 8, 8],
            padding: 8,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {cfg.tags.map((item: string) => (
            <Tag key={item} color="#F0F2F5" text={item} />
          ))}
        </Rect>
      </Group>
    );
  };
  const Anchor = () => {
    return (
      <Group>
        <Rect
          style={{
            width: 20,
            height: 10,
            fill: "#3EA1FA",
            stroke: "#3EA1FA",
          }}
        />
      </Group>
    );
  };
  G6.registerNode("vnuma", createNodeFromReact(Card1));
  G6.registerNode("pnuma", createNodeFromReact(Card2));
  G6.registerNode("anchor", createNodeFromReact(Anchor));

  G6.registerNode("Ring", {
    drawShape(cfg: any, group?: IGroup) {
      const { radius, lineWidth, percent, borderWidth, borderColor } = cfg;
      const inAngle = percent * Math.PI * 2; // 入度在饼图中的夹角大小
      const inArcEnd = [radius * Math.cos(inAngle), radius * Math.sin(inAngle)]; // 入度饼图弧结束位置
      let lineColor = "#3EA1FA";
      if (percent < 0.6) {
        lineColor = "#3EA1FA";
      } else if (percent < 0.8) {
        lineColor = "#FFB53F";
      } else {
        lineColor = "#FF766F";
      }
      const keyShape = group?.addShape("circle", {
        attrs: {
          x: 0,
          y: 0,
          r: radius + lineWidth / 2,
          fill: "#DBDDE0",
          stroke: borderColor,
          lineWidth: borderWidth,
        },
        name: "in-circle",
      });

      group?.addShape("circle", {
        attrs: {
          x: 0,
          y: 0,
          fill: "#fff",
          r: radius - lineWidth / 2,
          stroke: borderColor,
          lineWidth: borderWidth,
        },
        name: "out-circle",
      });

      if (percent < 1) {
        group?.addShape("circle", {
          attrs: {
            x: radius,
            y: 0,
            r: lineWidth / 2,
            fill: lineColor,
          },
          name: "start-node",
        });

        group?.addShape("circle", {
          attrs: {
            x: inArcEnd[0],
            y: inArcEnd[1],
            r: lineWidth / 2,
            fill: lineColor,
          },
          name: "end-node",
        });

        group?.addShape("path", {
          attrs: {
            lineWidth,
            stroke: lineColor,
            path: [
              ["M", radius, 0],
              [
                "A",
                radius,
                radius,
                0,
                percent >= 0.5 ? 1 : 0,
                1,
                inArcEnd[0],
                inArcEnd[1],
              ],
            ],
          },
          name: "arc-line",
        });
      } else {
        group?.addShape("circle", {
          attrs: {
            x: 0,
            y: 0,
            r: radius,
            stroke: lineColor,
            lineWidth,
          },
          name: "full-circle",
        });
      }
      return keyShape!;
    },
  });
};
export default register;
