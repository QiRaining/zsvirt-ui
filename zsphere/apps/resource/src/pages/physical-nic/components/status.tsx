import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import { PicNicStatus } from "../constant";

interface IProps {
  status: PicNicStatus | string;
}
interface keyMap {
  [key: string]: any;
}

const Status: React.FC<IProps> = ({ status }) => {
  const intl = useIntl();

  const map: keyMap = {
    [PicNicStatus.Connected]: {
      name: intl.formatMessage({ id: "Connected", defaultMessage: "Connected" }),
      type: "success",
    },
    [PicNicStatus.Notconnected]: {
      name: intl.formatMessage({
        id: "Notconnected",
        defaultMessage: "Unconnected",
      }),
      type: "disabled",
    },
  };

  const { type, name } = map[status];
  return <ZState type={type} name={name} prefix="dot" />;
};

export default Status;
