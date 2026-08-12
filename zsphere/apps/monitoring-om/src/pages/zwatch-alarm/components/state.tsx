import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  state: "Enabled" | "Disabled" | string;
}

interface keyMap {
  [key: string]: any;
}

const State: React.FC<IProps> = ({ state }) => {
  const intl = useIntl();

  const map: keyMap = {
    Enabled: {
      name: intl.formatMessage({ id: "enable", defaultMessage: "Enable " }),
      type: "success",
      icon: "play-circle-fill",
    },
    Disabled: {
      name: intl.formatMessage({ id: "disable", defaultMessage: "Disable" }),
      type: "error",
      icon: "stop-circle-fill",
    },
  };

  const { type, name, icon } = map[state];
  return <ZState type={type} name={name} icon={icon} />;
};

export default State;
