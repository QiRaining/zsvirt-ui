import { State as ZState } from "@zstack/zsphere-components";
import React from "react";
import { useIntl } from "react-intl";

import { PciDeviceVirtStatus } from "../constant";

interface IProps {
  state: PciDeviceVirtStatus | string;
  isSriov?: boolean;
}

interface keyMap {
  [key: string]: any;
}

const State: React.FC<IProps> = ({ state, isSriov }) => {
  const intl = useIntl();

  const map: keyMap = {
    [PciDeviceVirtStatus.UNKNOWN]: {
      name: intl.formatMessage({ id: "UNKNOWN", defaultMessage: "Unknown" }),
      type: "disabled",
    },
    [PciDeviceVirtStatus.VIRTUALIZED_BYPASS_ZSTACK]: {
      name: intl.formatMessage({
        id: "VIRTUALIZED_BYPASS_ZSTACK",
        defaultMessage: "Unknown",
      }),
      type: "disabled",
    },
    [PciDeviceVirtStatus.SRIOV_VIRTUALIZABLE]: {
      name: intl.formatMessage({
        id: "SRIOV_VIRTUALIZABLE",
        defaultMessage: "Virtualizable",
      }),
      type: "success",
    },
    [PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZABLE]: {
      name: intl.formatMessage({
        id: "VFIO_MDEV_VIRTUALIZABLE",
        defaultMessage: "Virtualizable",
      }),
      type: "success",
    },
    [PciDeviceVirtStatus.SRIOV_VIRTUALIZED]: {
      name: intl.formatMessage({
        id: "SRIOV_VIRTUALIZED",
        defaultMessage: "Virtualized",
      }),
      type: "error",
    },
    [PciDeviceVirtStatus.VFIO_MDEV_VIRTUALIZED]: {
      name: intl.formatMessage({
        id: "VFIO_MDEV_VIRTUALIZED",
        defaultMessage: "Virtualized",
      }),
      type: "error",
    },
    [PciDeviceVirtStatus.UNVIRTUALIZABLE]: {
      name: intl.formatMessage({
        id: "UNVIRTUALIZABLE",
        defaultMessage: "Unvirtualizable",
      }),
      type: "disabled",
    },
  };

  const sriovMap: keyMap = {
    [PciDeviceVirtStatus.UNKNOWN]: {
      name: intl.formatMessage({ id: "UNKNOWN", defaultMessage: "Unknown" }),
      type: "disabled",
    },
    [PciDeviceVirtStatus.SRIOV_VIRTUALIZABLE]: {
      name: intl.formatMessage({ id: "not.enabled", defaultMessage: "No" }),
      type: "disabled",
    },
    [PciDeviceVirtStatus.SRIOV_VIRTUALIZED]: {
      name: intl.formatMessage({ id: "activated", defaultMessage: "Enabled" }),
      type: "success",
    },
    [PciDeviceVirtStatus.UNVIRTUALIZABLE]: {
      name: intl.formatMessage({ id: "not.support", defaultMessage: "Unsupported" }),
      type: "error",
    },
  };

  const { type, name } = isSriov ? sriovMap[state] : map[state];
  return <ZState type={type} name={name} prefix="dot" />;
};

export default State;
