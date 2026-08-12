import { Icon } from "@zstack/icon";
import { ZSVForm } from "@zstack/zsphere-components";
import { Button } from "antd";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import type { StepType, TaskStatus } from "../types";
import InstallationGuide from "./flow-chart";
import StepCard from "./step-card";

import style from "../style.module.less";

const { Card } = ZSVForm;

interface InstallationDeployCardProps {
  currentStep: StepType;
  taskStatus: TaskStatus;
  onStepProgression: () => void;
  onReuploadClick: () => void;
  onViewOperationLog: () => void;
}

const InstallationDeployCard: React.FC<InstallationDeployCardProps> =
  React.memo(
    ({
      currentStep,
      taskStatus,
      onStepProgression,
      onReuploadClick,
      onViewOperationLog,
    }) => {
      const intl = useIntl();
      const [isGuideVisible, setIsGuideVisible] = useState(true);

      return (
        <Card
          title={intl.formatMessage({
            id: "migration.installation.deployment",
            defaultMessage: "Deployment",
          })}
          extra={
            <Button
              type="link"
              className={style.extraBtn}
              onClick={() => setIsGuideVisible(!isGuideVisible)}
            >
              {isGuideVisible ? (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Icon type="eye-off" />
                  {intl.formatMessage({
                    id: "hide.guide",
                    defaultMessage: "Hide Tips",
                  })}
                </span>
              ) : (
                <span
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Icon type="eye" />
                  {intl.formatMessage({
                    id: "view.guide",
                    defaultMessage: "Show Tips",
                  })}
                </span>
              )}
            </Button>
          }
        >
          {isGuideVisible && <InstallationGuide />}
          <div className={style["step-flow"]}>
            <StepCard
              currentStep={currentStep}
              taskStatus={taskStatus}
              onPrimaryClick={onStepProgression}
              onRetryClick={onStepProgression}
              onSecondaryClick={onReuploadClick}
              onTaskLogClick={onViewOperationLog}
            />
          </div>
        </Card>
      );
    },
  );

export default InstallationDeployCard;
