import { Icon, type IconTypes } from "@zstack/icon";
import { Color } from "@zstack/utils";
import { Illustration, IllustrationTypes } from "@zstack/zsphere-illustration";
import classNames from "classnames";
import React from "react";

import "./style.less";

interface IProps extends React.HTMLAttributes<HTMLSpanElement> {
  resourceKey: IconTypes;
  color?: Color.ISemantic;
  state: string;
  size?: number;
  colorNumber?: Color.INeutralNumber;
  className?: string;
}

const stateToIcon = [
  [
    "state-loader",
    [
      "starting",
      "stopping",
      "expunging",
      "migrating",
      "destroying",
      "rebooting",
      "resuming",
    ],
  ],
  ["state-deleted", ["destroyed"]],
  //  new
  ["state-alert-new", ["warning"]],
  ["state-connecting", ["connecting"]],
  ["state-connected", ["connected", "enabled"]],
  ["state-pause-new", ["pause", "paused"]],
  ["state-play-new", ["running"]],
  ["state-question", ["unknow"]],
  ["state-disconnected", ["disconnected"]],
  ["state-stop-new", ["stopped", "disabled"]],
  ["state-maintenance", ["maintenance"]],
  ["state-preMaintenance", ["premaintenance"]],
];

const stateToDot = [
  ["state-connected", ["connected"]],
  ["state-disconnected", ["disconnected"]],
  ["state-connecting", ["connecting"]],
];

const IconState: React.FC<IProps> = ({
  resourceKey,
  state,
  color,
  size = 16,
  colorNumber,
  className,
}) => {
  const dotKey = stateToDot.find(
    (item) => item[1].indexOf(state.toLocaleLowerCase()) > -1,
  )?.[0] as string;

  const stateKey =
    stateToIcon.find(
      (item) => item[1].indexOf(state.toLocaleLowerCase()) > -1,
    )?.[0] ?? "state-unknow";

  const stateDom = dotKey ? (
    <div
      style={{
        width: size - 7,
        height: size - 7,
        borderRadius: (size - 7) / 2,
      }}
      className={classNames(["container-icon-dolt", `container-${dotKey}`])}
    />
  ) : (
    <div className="container-icon-state">
      <Illustration type={stateKey as IllustrationTypes} size={size - 6} />
    </div>
  );

  return (
    <span className={classNames(["icon-state-container", className])}>
      <Icon
        type={resourceKey as IconTypes}
        color={color}
        colorNumber={colorNumber as Color.INeutralNumber}
      />
      {stateDom}
    </span>
  );
};

export default IconState;
