import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  state: "Enabled" | "Disabled" | string;
}

const State: React.FC<IProps> = ({ state }) => {
  const intl = useIntl();
  const name =
    state === "Enabled"
      ? intl.formatMessage({ id: "usb.state.enabled", defaultMessage: "Enabled" })
      : intl.formatMessage({
          id: "usb.state.disabled",
          defaultMessage: "Disabled",
        });
  const type = state === "Enabled" ? "success" : "error";
  const icon = state === "Enabled" ? "play-circle-fill" : "stop-circle-fill";
  return <ZState type={type} name={name} icon={icon} />;
};

export default State;
