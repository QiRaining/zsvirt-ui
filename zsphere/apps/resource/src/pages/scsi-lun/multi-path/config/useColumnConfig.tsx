import { Text } from "@zstack/design";
import { Constant, Link } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/scsi-lun";
import { LeftNavType } from "@zstack/zsphere-types";
import type { LunDeviceMultiPathDetail } from "@zstack/zsphere-types/graphql";
import { capitalize, pick } from "lodash-es";
import React from "react";

interface IProps {
  zoneUuid: string;
  scsiLunSourceType?: string;
}

export default ({ zoneUuid, scsiLunSourceType }: IProps) => {
  return useColumnConfig<LunDeviceMultiPathDetail>([
    {
      key: "disk",
      render: ({ disk }) => {
        return (
          <Text>
            <Link
              to={`/zone/detail?uuid=${zoneUuid}&leftnav=${LeftNavType.DataStorage}&activeKey=storageTarget&scsiLunSourceType=${scsiLunSourceType}`}
              microAppName="virtualization-resource"
              key={zoneUuid}
            >
              {disk}
            </Link>
          </Text>
        );
      },
    },
    {
      key: "state",
      filterEnumType: ConstantType.MultiPathHealthState,
      filterOptions: pick(ConstantEnum, ["running", "failed"]),
      render: (current) => {
        return current?.state ? (
          <Constant
            value={current.state}
            enumType={ConstantType.MultiPathHealthState}
          />
        ) : null;
      },
    },
    {
      key: "status",
      formatter: (current) => current?.status && capitalize(current.status),
    },
  ]);
};
