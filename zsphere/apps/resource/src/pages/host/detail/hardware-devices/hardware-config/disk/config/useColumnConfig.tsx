import { gql } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { TableDetailLink } from "@zstack/zsphere-components";
import { Constant } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/disk";
import { useAction } from "@zstack/zsphere-hooks";
import { DiskReadyState, HostStatus } from "@zstack/zsphere-types";
import type { HostBlockDevices } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import cls from "classnames";
import { isNil, debounce } from "lodash-es";
import type { FC } from "react";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

const locateLocalRaidPhysicalDrive = gql`
  mutation locateLocalRaidPhysicalDrive(
    $input: LocateLocalRaidPhysicalDriveInput!
  ) {
    locateLocalRaidPhysicalDrive(input: $input) {
      actionId
    }
  }
`;

interface IRaidLightSwitch {
  uuid: string;
  locateStatus?: string;
  state?: DiskReadyState;
  hostStatus?: HostStatus;
}

const _RaidLightSwitch: FC<IRaidLightSwitch> = ({
  uuid,
  locateStatus,
  state,
  hostStatus,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const lightOn = locateStatus === "Enabled";
  const lightDisabled =
    state !== DiskReadyState.Normal || hostStatus !== HostStatus.Connected;
  const hanleLightSwitch = () => {
    if (lightDisabled) {
      return;
    }
    doAction({
      mutation: locateLocalRaidPhysicalDrive,
      payload: {
        uuid,
        locate: !lightOn,
      },
      name: lightOn
        ? intl.formatMessage({ id: "lightOff", defaultMessage: "Light Off" })
        : intl.formatMessage({ id: "lightOn", defaultMessage: "Light Up" }),
      total: 1,
    });
  };
  return (
    <div
      className={cls(
        style.lightSwitch,
        { [style.lightOn]: lightOn },
        { [style.disabled]: lightDisabled },
      )}
      onClick={debounce(hanleLightSwitch, 300)}
    >
      <Icon type={lightOn ? "bulb-fill" : "bulb"} size={16} />
    </div>
  );
};

export default () => {
  return useColumnConfig<HostBlockDevices>([
    {
      key: "device",
      sortKey: "name",
      render: (record) => {
        return (
          <Text>
            <TableDetailLink currentRow={record}>{record.name}</TableDetailLink>
          </Text>
        );
      },
    },
    {
      key: "state",
      render: (current) => {
        if (isNil(current.smartPassed)) {
          return (
            <Constant
              enumType={ConstantType.HardwareState}
              value={ConstantEnum.Unknown}
            />
          );
        }
        if (current.smartPassed) {
          return (
            <Constant
              enumType={ConstantType.HardwareState}
              value={ConstantEnum.Normal}
            />
          );
        }
        return (
          <Constant
            enumType={ConstantType.HardwareState}
            value={ConstantEnum.Abnormal}
          />
        );
      },
    },
    {
      key: "diskType",
      formatter: (record) => record.mediaType,
    },
    {
      key: "size",
      formatter: (record) => formatStorage(record.size ?? 0, 2),
    },
  ]);
};
