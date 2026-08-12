import { ReactMarkdown } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import { NODE_H, ARROW_COLOR, FLOW_ARROW_STROKE_WIDTH } from "./constants";
import {
  LIGHT_BLUE_BG,
  LIGHT_BLUE_BORDER,
  LIGHT_GREEN_BG,
  LIGHT_GREEN_BORDER,
  LIGHT_YELLOW_BG,
  LIGHT_YELLOW_BORDER,
  LIGHT_PURPLE_BG,
  LIGHT_PURPLE_BORDER,
} from "./constants";
import { FlowNode, renderArrow, ArrowDefs } from "./flow-node";
import type { FlowProps } from "./types";

import style from "../style.module.less";

export const MigrationFlow: React.FC<FlowProps> = React.memo(({ layout }) => {
  const intl = useIntl();
  const { svgWidth, nodeW, getNodeX } = layout;
  const mainRowY = 16;

  const mainNodes = [
    {
      id: "addResource",
      label: intl.formatMessage({
        id: "migration.step.add.resource",
        defaultMessage: "Add Migration Resources",
      }),
      bg: LIGHT_BLUE_BG,
      border: LIGHT_BLUE_BORDER,
      icon: "source",
      iconColor: "info" as const,
      iconColorNumber: 600 as const,
      infoTooltip: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "migration.step.add.resource.tip",
            defaultMessage: "Add Migration Resources\n\nAfter the migration service is deployed, you can add migration resources as needed.\n\n1. Platforms:\n    - Source Platform: Supports adding VMware platforms as the source for VM migration.\n    - Target Platform: Automatically added after the migration service is deployed.\n2. Data Gateways:\n    - One data gateway is automatically added after the migration service is deployed. Additional gateways can be added based on migration requirements.\n    - When adding a data gateway, ensure network connectivity between the gateway, source platform, target platform, and migration service management platform to enable data transmission.",
          })}
        </ReactMarkdown>
      ),
    },
    {
      id: "createTask",
      label: intl.formatMessage({
        id: "migration.step.create.task",
        defaultMessage: "New Migration Task",
      }),
      bg: LIGHT_BLUE_BG,
      border: LIGHT_BLUE_BORDER,
      icon: "file-add",
      iconColor: "info" as const,
      iconColorNumber: 600 as const,
    },
    {
      id: "dataSync",
      label: intl.formatMessage({
        id: "migration.step.vm.data.sync",
        defaultMessage: "VM Data Synchronization",
      }),
      bg: LIGHT_BLUE_BG,
      border: LIGHT_BLUE_BORDER,
      icon: "sync",
      iconColor: "info" as const,
      iconColorNumber: 600 as const,
    },
    {
      id: "cutover",
      label: intl.formatMessage({
        id: "migration.step.execute.cutover",
        defaultMessage: "Perform Cutover",
      }),
      bg: LIGHT_BLUE_BG,
      border: LIGHT_BLUE_BORDER,
      icon: "migrate",
      iconColor: "info" as const,
      iconColorNumber: 600 as const,
    },
    {
      id: "cutoverDone",
      label: intl.formatMessage({
        id: "migration.step.vm.cutover.complete",
        defaultMessage: "VM cutover complete.",
      }),
      bg: LIGHT_GREEN_BG,
      border: LIGHT_GREEN_BORDER,
      icon: "checkmark-circle",
      iconColor: "positive" as const,
      iconColorNumber: 600 as const,
    },
  ];

  // Branch nodes
  const branchGap = 20;
  const branchY = mainRowY + NODE_H + branchGap;

  const dataSyncX = getNodeX(2);
  const cutoverX = getNodeX(3);

  const svgHeight = branchY + NODE_H + 16;

  // Curved arrow from dataSync right side to incrementalSync left side
  const curveStartX = dataSyncX + nodeW;
  const curveStartY = mainRowY + NODE_H;
  const curveEndX = cutoverX;
  const curveEndY = branchY + NODE_H / 2;
  const curveMidY = branchY - 2;
  const curvePath = `M ${curveStartX} ${curveStartY} C ${
    curveStartX + 30
  } ${curveMidY}, ${curveEndX - 30} ${curveMidY}, ${curveEndX} ${curveEndY}`;

  return (
    <div className={style["flowchart-flow"]}>
      <div className={style["flowchart-flow-title"]}>
        {intl.formatMessage({
          id: "migration.cutover.flow.title",
          defaultMessage: "Migration and Cutover Process",
        })}
      </div>
      <div className={style["flowchart-section"]}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ArrowDefs />

          {/* Main row nodes */}
          {mainNodes.map((node, i) => (
            <FlowNode
              key={node.id}
              x={getNodeX(i)}
              y={mainRowY}
              label={node.label}
              bg={node.bg}
              border={node.border}
              nodeW={nodeW}
              icon={node.icon}
              iconColor={node.iconColor}
              iconColorNumber={node.iconColorNumber}
              infoTooltip={node.infoTooltip}
            />
          ))}

          {/* Main row horizontal arrows */}
          {mainNodes
            .slice(0, -1)
            .map((_, i) =>
              renderArrow(
                getNodeX(i) + nodeW,
                mainRowY + NODE_H / 2,
                getNodeX(i + 1),
                mainRowY + NODE_H / 2,
                `migrate-arrow-${i}`,
              ),
            )}

          {/* Branch node: "迁移切换测试" below "虚拟机数据同步" */}
          <FlowNode
            x={dataSyncX}
            y={branchY}
            label={intl.formatMessage({
              id: "migration.step.cutover.test",
              defaultMessage: "Migration Cutover Test",
            })}
            bg={LIGHT_YELLOW_BG}
            border={LIGHT_YELLOW_BORDER}
            nodeW={nodeW}
            icon="flash"
            iconColor="alert"
            iconColorNumber={600}
          />

          {/* Branch node: "增量同步" below "执行割接" */}
          <FlowNode
            x={cutoverX}
            y={branchY}
            label={intl.formatMessage({
              id: "migration.step.incremental.sync",
              defaultMessage: "Incremental Sync",
            })}
            bg={LIGHT_PURPLE_BG}
            border={LIGHT_PURPLE_BORDER}
            nodeW={nodeW}
            icon="repeat"
            iconColor="pending"
            iconColorNumber={600}
          />

          {/* Arrow: dataSync bottom -> cutoverTest top */}
          {renderArrow(
            dataSyncX + nodeW / 2,
            mainRowY + NODE_H,
            dataSyncX + nodeW / 2,
            branchY,
            "datasync-to-cutovertest",
          )}

          {/* Curved arrow: dataSync right area -> incrementalSync left */}
          <path
            d={curvePath}
            fill="none"
            stroke={ARROW_COLOR}
            strokeWidth={FLOW_ARROW_STROKE_WIDTH}
            markerEnd="url(#arrowHead)"
          />

          {/* Arrow: incrementalSync top -> cutover bottom */}
          {renderArrow(
            cutoverX + nodeW / 2,
            branchY,
            cutoverX + nodeW / 2,
            mainRowY + NODE_H,
            "incrementalsync-to-cutover",
          )}
        </svg>
      </div>
    </div>
  );
});
