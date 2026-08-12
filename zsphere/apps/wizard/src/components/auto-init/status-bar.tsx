import { Icon } from "@zstack/icon";
import { Progress } from "antd";
import { findIndex, findLastIndex } from "lodash-es";
import type { FC } from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import type { IDeployState, IDeploySteps, IStepType } from "./types";

import style from "./style.module.less";

interface IProps {
  state: IDeployState;
  steps: IDeploySteps;
  stepNameMap: Map<IStepType, string>;
  onStart?: Function;
  onBack?: Function;
  onRetry?: Function;
}

const StatusBar: FC<IProps> = ({ state, steps, stepNameMap }) => {
  const intl = useIntl();

  const _hasNetworkStep = steps.some((item) => item.type === "L2Network");

  // 计算当前执行步骤和总步骤
  const { current, total } = useMemo(() => {
    const totalSteps = steps.length;
    let currentStep = findIndex(steps, (item) => item.state === "running") + 1;
    // 如果没有运行中的任务，可能是刚开始或已经全部完成
    if (currentStep === 0) {
      // 如果有失败的任务，找到最后一个完成的任务
      if (state === "fail") {
        currentStep =
          findLastIndex(steps, (item) => item.state === "finish") + 1;
      }
    }
    return { current: currentStep, total: totalSteps };
  }, [steps, state]);

  // 获取当前运行资源的名称
  const currentResourceName = useMemo(() => {
    const runningStep = steps.find((item) => item.state === "running");
    return runningStep ? stepNameMap.get(runningStep.type) : "";
  }, [steps, stepNameMap]);

  // 根据状态渲染不同内容
  const renderContent = () => {
    if (state === "running") {
      return (
        <div className={style.statusContainer}>
          <div className={style.progressCircle}>
            <Progress
              type="circle"
              percent={Math.floor((current / total) * 100)}
              width={48}
              strokeWidth={8}
              status="active"
              format={() => (
                <Icon
                  style={{ color: "#0076F7", width: 24, height: 24 }} type="compass-fill"
                />
              )}
            />
          </div>
          <div className={style.statusInfo}>
            <div className={style.statusTitle}>
              {intl.formatMessage({
                id: "auto.init.running.title",
                defaultMessage: "Automatic Initialization Ongoing",
              })}
              ：{current}/{total}
            </div>
            <div className={style.statusDesc}>
              {intl.formatMessage({
                id: "current.deploy.resource",
                defaultMessage: "Current Resource",
              })}
              ：{currentResourceName}
            </div>
          </div>
        </div>
      );
    }

    if (state === "fail") {
      return (
        <div className={style.statusContainer}>
          <div className={style.progressContainer}>
            <div className={style.progressCircle}>
              <Progress
                type="circle"
                percent={0}
                width={48}
                strokeWidth={8}
                format={() => (
                  <Icon
                    style={{ color: "#FF3F46", width: 24, height: 24 }} type="close-circle-fill"
                  />
                )}
              />
            </div>
          </div>
          <div className={style.statusInfo}>
            <div className={style.statusTitle}>
              {intl.formatMessage({
                id: "auto.init.fail.title",
                defaultMessage: "Automatic Initialization Interrupted",
              })}
              ：{current}/{total}
            </div>
            <div className={style.statusDesc}>
              {intl.formatMessage({
                id: "delpoy.fail.info",
                defaultMessage:
                  'Failed to create or add some resources. Click "Retry" to continue from where it stopped.',
              })}
            </div>
          </div>
        </div>
      );
    }

    // 初始状态
    return (
      <div className={style.initContent}>
        <div className={style.initTitle}>
          {intl.formatMessage({
            id: "delpoy.init.title",
            defaultMessage: "Check Following Predefined Resource Configurations and Start Auto Initialization As Needed",
          })}
        </div>
      </div>
    );
  };

  return <div className={style.bar}>{renderContent()}</div>;
};

export default StatusBar;
