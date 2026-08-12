import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import { State as IState } from "../constant";

interface IProps {
  state: IState | string;
}

interface keyMap {
  [key: string]: any;
}

const State: React.FC<IProps> = ({ state }) => {
  const intl = useIntl();

  const map: keyMap = {
    [IState.Enabled]: {
      name: intl.formatMessage({ id: "enabled", defaultMessage: "Enabled" }),
      type: "success",
      icon: "play-circle-fill",
    },
    [IState.Disabled]: {
      name: intl.formatMessage({ id: "disabled", defaultMessage: "Disabled" }),
      type: "warning",
      icon: "",
    },
    [IState.Staled]: {
      name: intl.formatMessage({ id: "staled", defaultMessage: "Deleted" }),
      type: "error",
      icon: "",
    },
  };

  const { type, name, icon } = map[state];
  return <ZState type={type} name={name} icon={icon} />;
};

export default State;
