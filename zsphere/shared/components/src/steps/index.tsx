import { Steps as AntSteps } from "antd";
import cls from "classnames";
import React from "react";

import { getBaseCls } from "../_utils/common";

import "./style.less";
import type { IStepsProps } from "./type";

interface StepsType extends React.FC<IStepsProps> {
  Step: typeof AntSteps.Step;
}

const baseStepsCls = getBaseCls("steps");

const Steps: StepsType = ({ className, style, title, direction, ...props }) => (
  <AntSteps
    progressDot
    direction={direction}
    style={style}
    className={cls(
      baseStepsCls,
      { [getBaseCls(`vertical-steps`)]: direction === "vertical" },
      { [getBaseCls("horizontal-steps")]: direction === "horizontal" },
      className,
    )}
    {...props}
  />
);

Steps.Step = AntSteps.Step;

export default Steps;
export type { IStepsProps };
