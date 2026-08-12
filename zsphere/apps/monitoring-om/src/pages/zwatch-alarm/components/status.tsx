import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  status: "OK" | "Alarm" | "InsufficientData" | string;
}
interface keyMap {
  [key: string]: any;
}

const Status: React.FC<IProps> = ({ status }) => {
  const intl = useIntl();

  const map: keyMap = {
    OK: {
      name: intl.formatMessage({ id: "monitoring", defaultMessage: "Monitoring" }),
      type: "success",
    },
    Alarm: {
      name: intl.formatMessage({ id: "triggered", defaultMessage: "Triggered" }),
      type: "error",
    },
    InsufficientData: {
      name: intl.formatMessage({
        id: "insufficientData",
        defaultMessage: "Insufficient",
      }),
      type: "progress",
    },
  };

  const { type, name } = map[status];
  return <ZState type={type} name={name} prefix="dot" />;
};

export default Status;
