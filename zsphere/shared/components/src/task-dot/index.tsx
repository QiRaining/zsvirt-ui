import { Icon } from "@zstack/icon";
import { OperationTask } from "@zstack/zsphere-types/graphql";
import React from "react";

import style from "./style.module.less";

export interface IProps {
  task: OperationTask;
  checked: boolean;
  onClick: (task: OperationTask) => void;
}

const TaskDot: React.FC<IProps> = ({ task, onClick, checked }) => {
  const { status } = task;
  return (
    <div
      onClick={() => onClick(task)}
      className={`${style.taskDotBasic} ${style[`taskDot${status}`]} ${
        checked ? style.checked : ""
      }`}
    >
      {checked && <Icon type="checkmark" />}
    </div>
  );
};

export default TaskDot;
