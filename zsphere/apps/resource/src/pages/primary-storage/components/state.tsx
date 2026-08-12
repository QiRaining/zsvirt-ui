import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  state: "Enabled" | "Disabled" | "Maintenance" | "Deleting" | string;
}

interface keyMap {
  [key: string]: any;
}

const State: React.FC<IProps> = ({ state }) => {
  const intl = useIntl();

  const map: keyMap = {
    Enabled: {
      name: intl.formatMessage({
        id: "primary.storage.state.enabled",
        defaultMessage: "Enabled",
      }),
      type: "success",
      icon: "play-circle-fill",
    },
    Disabled: {
      name: intl.formatMessage({
        id: "primary.storage.state.disabled",
        defaultMessage: "Disabled",
      }),
      type: "error",
      icon: "stop-circle-fill",
    },
    Maintenance: {
      name: intl.formatMessage({
        id: "primary.storage.state.maintenance",
        defaultMessage: "In Maintenance",
      }),
      type: "warning",
      icon: "",
    },
    Deleting: {
      name: intl.formatMessage({
        id: "primary.storage.state.Deleting",
        defaultMessage: "Deleting",
      }),
      type: "warning",
      icon: "",
    },
  };

  const { type, name, icon } = map[state] || {};
  return <ZState type={type} name={name} icon={icon} />;
};

export default State;
