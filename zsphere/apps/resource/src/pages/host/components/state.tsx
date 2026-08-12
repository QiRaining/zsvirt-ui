import { State as ZState } from "@zstack/zsphere-components";
import { HostState } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  state: HostState | string;
}

interface keyMap {
  [key: string]: any;
}

const State: React.FC<IProps> = ({ state }) => {
  const intl = useIntl();

  const map: keyMap = {
    [HostState.Enabled]: {
      name: intl.formatMessage({
        id: "host.state.enabled",
        defaultMessage: "Enabled",
      }),
      type: "success",
      icon: "play-circle-fill",
    },
    [HostState.Disabled]: {
      name: intl.formatMessage({
        id: "host.state.disabled",
        defaultMessage: "Disable",
      }),
      type: "error",
      icon: "stop-circle-fill",
    },
    [HostState.PreMaintenance]: {
      name: intl.formatMessage({
        id: "host.state.preMaintenance",
        defaultMessage: "Pre-Maintenance Mode",
      }),
      type: "progress",
      icon: "wrench-circle-fill",
    },
    [HostState.Maintenance]: {
      name: intl.formatMessage({
        id: "host.state.maintenance",
        defaultMessage: "Maintenance Mode",
      }),
      type: "warning",
      icon: "wrench-circle-fill",
    },
  };

  const { type, name, icon } = map[state];
  return <ZState type={type} name={name} icon={icon} />;
};

export default State;
