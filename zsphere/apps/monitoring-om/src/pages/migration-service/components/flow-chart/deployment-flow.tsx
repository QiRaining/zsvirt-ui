import { ReactMarkdown } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import { NODE_H } from "./constants";
import {
  LIGHT_BLUE_BG,
  LIGHT_BLUE_BORDER,
  LIGHT_GRAY_BG,
  LIGHT_GRAY_BORDER,
  LIGHT_GREEN_BG,
  LIGHT_GREEN_BORDER,
} from "./constants";
import { FlowNode, renderArrow, ArrowDefs } from "./flow-node";
import type { FlowProps } from "./types";

import style from "../style.module.less";

export const DeploymentFlow: React.FC<FlowProps> = React.memo(({ layout }) => {
  const intl = useIntl();
  const { svgWidth, nodeW, getNodeX } = layout;
  const nodeY = 16;

  const nodes = [
    {
      id: "upload",
      label: intl.formatMessage({
        id: "migration.step.upload.package",
        defaultMessage: "Upload Migration Service Package",
      }),
      bg: LIGHT_BLUE_BG,
      border: LIGHT_BLUE_BORDER,
      icon: "cloud-upload",
      iconColor: "info" as const,
      iconColorNumber: 600 as const,
    },
    {
      id: "extract",
      label: intl.formatMessage({
        id: "migration.step.auto.extract",
        defaultMessage: "Auto Acquire File",
      }),
      bg: LIGHT_GRAY_BG,
      border: LIGHT_GRAY_BORDER,
      icon: "file-text",
      iconColor: "neutral" as const,
      iconColorNumber: 700 as const,
    },
    {
      id: "install",
      label: intl.formatMessage({
        id: "migration.step.install.service",
        defaultMessage: "Deploy Migration Service",
      }),
      bg: LIGHT_BLUE_BG,
      border: LIGHT_BLUE_BORDER,
      icon: "deploy",
      iconColor: "info" as const,
      iconColorNumber: 600 as const,
    },
    {
      id: "init",
      label: intl.formatMessage({
        id: "migration.step.auto.init",
        defaultMessage: "Auto Initialization ",
      }),
      bg: LIGHT_GRAY_BG,
      border: LIGHT_GRAY_BORDER,
      icon: "settings-2",
      iconColor: "neutral" as const,
      iconColorNumber: 700 as const,
      infoTooltip: (
        <ReactMarkdown>
          {intl.formatMessage({
            id: "migration.step.auto.init.tip",
            defaultMessage: "### Automatic Initialization\n\nAfter the migration service is deployed, the system automatically adds the data gateway and target platform.",
          })}
        </ReactMarkdown>
      ),
    },
    {
      id: "deployDone",
      label: intl.formatMessage({
        id: "migration.step.deploy.complete",
        defaultMessage: "Migration service deployment complete.",
      }),
      bg: LIGHT_GREEN_BG,
      border: LIGHT_GREEN_BORDER,
      icon: "checkmark-circle",
      iconColor: "positive" as const,
      iconColorNumber: 600 as const,
    },
  ];

  const svgHeight = nodeY + NODE_H + 16;

  return (
    <div className={style["flowchart-flow"]}>
      <div className={style["flowchart-flow-title"]}>
        {intl.formatMessage({
          id: "migration.deployment.flow.title",
          defaultMessage: "Migration Service Deployment Process",
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

          {/* Nodes */}
          {nodes.map((node, i) => (
            <FlowNode
              key={node.id}
              x={getNodeX(i)}
              y={nodeY}
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

          {/* Horizontal arrows */}
          {nodes
            .slice(0, -1)
            .map((_, i) =>
              renderArrow(
                getNodeX(i) + nodeW,
                nodeY + NODE_H / 2,
                getNodeX(i + 1),
                nodeY + NODE_H / 2,
                `deploy-arrow-${i}`,
              ),
            )}
        </svg>
      </div>
    </div>
  );
});
