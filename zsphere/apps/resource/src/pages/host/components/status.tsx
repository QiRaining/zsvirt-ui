import { State as ZState } from "@zstack/zsphere-components";
import { HostStatus } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  status: HostStatus | string;
  className?: string;
}
interface keyMap {
  [key: string]: any;
}

const Status: React.FC<IProps> = ({ status, className }) => {
  const intl = useIntl();

  const map: keyMap = {
    [HostStatus.Connected]: {
      name: intl.formatMessage({
        id: "host.status.connected",
        defaultMessage: "Connected",
      }),
      type: "success",
    },
    [HostStatus.Connecting]: {
      name: intl.formatMessage({
        id: "host.status.connecting",
        defaultMessage: "Connecting",
      }),
      type: "progress",
    },
    [HostStatus.Disconnected]: {
      name: intl.formatMessage({
        id: "host.status.disconnected",
        defaultMessage: "Disconnected",
      }),
      type: "error",
    },
  };

  const { type, name } = map[status];
  return <ZState className={className} type={type} name={name} prefix="dot" />;
};

export default Status;
