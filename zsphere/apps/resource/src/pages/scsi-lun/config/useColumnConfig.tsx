import { Text } from "@zstack/design";
import { LunTypeEnum } from "@zstack/virtualization-resource/src/pages/host/detail/luns";
import { TableDetailLink, useSetTab } from "@zstack/zsphere-components";
import { Constant } from "@zstack/zsphere-components";
import { ConstantType, ConstantEnum } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/scsi-lun";
import type { ScsiLun as IScsiLun } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { pick } from "lodash-es";
import React from "react";

interface IProps {
  view?: string;
  zoneUuid?: string;
}

export default ({ view, _zoneUuid }: IProps) => {
  const { setTabMultiple } = useSetTab();
  return useColumnConfig<IScsiLun>([
    {
      key: "name",
      render: (current) => {
        const { name, uuid, scsiLunHostRefs } = current;
        // 物理机维度才会显示lun的多路径列表
        if (view === "sub.host") {
          const targetHost = scsiLunHostRefs.find(
            (item: any) => item.scsiLunUuid === uuid,
          );

          if (targetHost && targetHost.hostUuid) {
            return (
              <Text>
                <TableDetailLink currentRow={current}>{name}</TableDetailLink>
              </Text>
            );
          }
        }

        if (view === "sub.storage.adapter") {
          return (
            <Text>
              <a
                onClick={() => {
                  sessionStorage.setItem(
                    "scsi.lun-sub.host-search-conditions",
                    JSON.stringify([
                      {
                        name: { key: "uuid", label: "UUID", type: "input" },
                        values: [{ key: uuid, label: uuid }],
                      },
                    ]),
                  );
                  setTabMultiple([
                    { contentId: "host-hardware-divices", newKey: "host.lun" },
                    { contentId: "host.lun", newKey: LunTypeEnum.Scsi },
                  ]);
                }}
              >
                {name}
              </a>
            </Text>
          );
        }

        return <Text>{name}</Text>;
      },
    },
    {
      key: "vm-instance.count",
      formatter: ({ scsiLunVmInstanceRefs = [] }) =>
        scsiLunVmInstanceRefs?.length || 0,
    },
    {
      key: "source",
      render: ({ source }) => (
        <Constant enumType={ConstantType.LunSource} value={source} />
      ),
    },
    {
      key: "size",
      formatter: ({ size = 0 }) => formatStorage(size, 2),
    },
    {
      key: "healthState",
      filterEnumType: ConstantType.MultiPathHealthState,
      filterOptions: pick(ConstantEnum, ["running", "failed"]),
      render: (current) => {
        return current?.healthState ? (
          <Constant
            value={current.healthState}
            enumType={ConstantType.MultiPathHealthState}
          />
        ) : null;
      },
    },
  ]);
};
