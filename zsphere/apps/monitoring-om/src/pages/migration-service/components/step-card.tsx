import { Icon } from "@zstack/icon";
import { State } from "@zstack/zsphere-components";
import { Button } from "antd";
import React from "react";
import { IntlShape, useIntl } from "react-intl";

import stepNumber1 from "../assets/step-number-1.webp";
import stepNumber2 from "../assets/step-number-2.webp";
import { StepType, TaskStatus } from "../types";

import style from "./style.module.less";

export const getTaskStatusInfo = (status: TaskStatus, intl: IntlShape) => {
  switch (status) {
    case "uploading":
    case "installing":
      return (
        <State
          type="progress"
          name={intl.formatMessage({ id: "ongoing", defaultMessage: "Ongoing" })}
        />
      );
    case "upload-failed":
    case "install-failed":
      return (
        <State
          type="error"
          name={intl.formatMessage({ id: "fail", defaultMessage: "Failed" })}
        />
      );
    default:
      return "";
  }
};

interface StepConfig {
  step: number;
  icon: string;
  title: string;
  description: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
}

interface StepCardProps {
  currentStep: StepType;
  taskStatus: TaskStatus;
  onPrimaryClick?: () => void;
  onRetryClick?: () => void;
  onSecondaryClick?: () => void;
  onTaskLogClick?: () => void;
}

const StepCard: React.FC<StepCardProps> = React.memo(
  ({
    currentStep,
    taskStatus,
    onPrimaryClick,
    onRetryClick,
    onSecondaryClick,
    onTaskLogClick,
  }) => {
    const intl = useIntl();

    const getStepConfig = (step: StepType): StepConfig => {
      switch (step) {
        case "upload":
          return {
            step: 1,
            icon: stepNumber1,
            title: intl.formatMessage({
              id: "migration.step.upload.title",
              defaultMessage: "Upload Migration Service Package",
            }),
            description: intl.formatMessage({
              id: "migration.step.upload.description",
              defaultMessage:
                "After uploading the installation package, the system automatically decompresses it and extracts the required files.",
            }),
            primaryButtonText: intl.formatMessage({
              id: "migration.step.upload.button",
              defaultMessage: "Upload",
            }),
          };
        case "install":
          return {
            step: 2,
            icon: stepNumber2,
            title: intl.formatMessage({
              id: "migration.step.install.title",
              defaultMessage: "Deploy Migration Service",
            }),
            description: intl.formatMessage({
              id: "migration.step.install.description",
              defaultMessage:
                "Select the appropriate specification based on your business requirements to deploy the migration service. Once deployed, you can use the migration service to migrate virtual machines to the target platform.",
            }),
            primaryButtonText: intl.formatMessage({
              id: "migration.step.install.button",
              defaultMessage: "Install",
            }),
            secondaryButtonText: intl.formatMessage({
              id: "migration.step.reupload.button",
              defaultMessage: "Reupload",
            }),
          };
      }
    };

    const stepConfig = getStepConfig(currentStep);

    const renderActionButtons = () => {
      // 进行中状态
      if (["uploading", "installing"].includes(taskStatus)) {
        return <></>;
      }

      // 失败状态
      if (["upload-failed", "install-failed"].includes(taskStatus)) {
        const retryButtons = [];

        if (currentStep === "install") {
          retryButtons.push(
            <Button
              key="reinstall"
              type="link"
              size="small"
              onClick={onRetryClick || onPrimaryClick}
            >
              {intl.formatMessage({
                id: "migration.step.reinstall.button",
                defaultMessage: "Reinstall",
              })}
            </Button>,
          );
        }

        retryButtons.push(
          <Button
            key="reupload"
            type="link"
            size="small"
            onClick={onSecondaryClick}
          >
            {intl.formatMessage({
              id: "migration.step.reupload.button",
              defaultMessage: "Reupload",
            })}
          </Button>,
        );

        return <>{retryButtons}</>;
      }

      // 默认状态
      return (
        <>
          <Button
            type="primary"
            onClick={onPrimaryClick}
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {stepConfig.primaryButtonText}
            <Icon type="arrow-right" size={12} />
          </Button>
          {stepConfig.secondaryButtonText && (
            <Button type="link" onClick={onSecondaryClick}>
              {stepConfig.secondaryButtonText}
            </Button>
          )}
        </>
      );
    };

    return (
      <div className={style["step-card"]}>
        <div className={style["step-header"]}>
          <div className={style["step-icon"]}>
            <img
              src={stepConfig.icon}
              alt=""
              style={{ width: 24, height: 24 }}
            />
          </div>
          <div className={style["step-content"]}>
            <div className={style["step-title"]}>{stepConfig.title}</div>
            <div className={style["step-description"]}>
              {stepConfig.description}
            </div>
            {taskStatus &&
            !["upload-ready", "install-ready"].includes(taskStatus) ? (
              <div className={style["task-with-status"]}>
                <div className={style["task-status"]}>
                  <span className={style["task-status-label"]}>
                    {intl.formatMessage({
                      id: "jobState",
                      defaultMessage: "Job Status",
                    })}
                    :
                  </span>
                  <span className={style["task-status-value"]}>
                    {getTaskStatusInfo(taskStatus, intl)}
                  </span>
                </div>
                <div className={style["action-buttons"]}>
                  {renderActionButtons()}
                </div>
              </div>
            ) : (
              <div className={style["step-actions"]}>
                <div className={style["action-buttons"]}>
                  {renderActionButtons()}
                </div>
              </div>
            )}
          </div>
          <div className={style["step-meta"]}>
            <div className={style["step-number"]}>
              {intl.formatMessage({
                id: "migration.step.number",
                defaultMessage: "Steps ",
              })}
              &nbsp;{stepConfig.step}&nbsp;/&nbsp;2
            </div>
            {[
              "uploading",
              "upload-failed",
              "installing",
              "install-failed",
            ].includes(taskStatus) && (
              <>
                <div className={style.rect} />
                <Button
                  type="link"
                  onClick={onTaskLogClick}
                  style={{ padding: 0 }}
                >
                  {intl.formatMessage({
                    id: "migration.step.task.log",
                    defaultMessage: "Task Logs",
                  })}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default StepCard;
