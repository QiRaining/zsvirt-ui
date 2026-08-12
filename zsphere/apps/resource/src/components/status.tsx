import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

enum HostIommuStatus {
  Inactive = "Inactive",
  Enabled = "Enabled",
  Active = "Active",
}

interface IProps {
  state: HostIommuStatus | string;
}

interface keyMap {
  [key: string]: any;
}

const Status: React.FC<IProps> = ({ state }) => {
  const intl = useIntl();

  const map: keyMap = {
    [HostIommuStatus.Inactive]: {
      name: intl.formatMessage({
        id: "hostIommu.status.inactive",
        defaultMessage: "Unavailable",
      }),
      type: "disabled",
    },
    [HostIommuStatus.Enabled]: {
      name: intl.formatMessage({
        id: "hostIommu.status.enabled",
        defaultMessage: "Enabled",
      }),
      type: "success",
    },
    [HostIommuStatus.Active]: {
      name: intl.formatMessage({
        id: "hostIommu.status.active",
        defaultMessage: "Available",
      }),
      type: "success",
    },
  };

  const { type, name } = map[state];
  return <ZState type={type} name={name} prefix="dot" />;
};

export default Status;
