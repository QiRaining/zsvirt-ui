import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  status: "Connected" | "Connecting" | "Disconnected" | string;
}
interface keyMap {
  [key: string]: any;
}

const Status: React.FC<IProps> = ({ status }) => {
  const intl = useIntl();

  const map: keyMap = {
    Connected: {
      name: intl.formatMessage({
        id: "primary.storage.status.connected",
        defaultMessage: "Connected",
      }),
      type: "success",
    },
    Connecting: {
      name: intl.formatMessage({
        id: "primary.storage.status.connecting",
        defaultMessage: "Connecting",
      }),
      type: "progress",
    },
    Disconnected: {
      name: intl.formatMessage({
        id: "primary.storage.status.disconnected",
        defaultMessage: "Disconnected",
      }),
      type: "error",
    },
  };

  const { type, name } = map[status] || {};
  return <ZState type={type} name={name} prefix="dot" />;
};

export default Status;
