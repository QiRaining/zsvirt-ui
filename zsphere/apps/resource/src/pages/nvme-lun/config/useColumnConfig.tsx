import { Text } from "@zstack/design";
import { useSetTab, TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/nvme-lun";
import type { NVMeLun as INVMeLun } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";

export enum LunTypeEnum {
  Scsi = "Scsi",
  NVMe = "NVMe",
}

export default ({ view }: { view?: string } = {}) => {
  const { setTabMultiple } = useSetTab();

  return useColumnConfig<INVMeLun>([
    {
      key: "name",
      render: (current) => {
        if (view === "sub.storage.adapter") {
          return (
            <Text>
              <a
                onClick={() => {
                  sessionStorage.setItem(
                    "nvme.lun-sub.host-search-conditions",
                    JSON.stringify([
                      {
                        name: { key: "uuid", label: "UUID", type: "input" },
                        values: [{ key: current.uuid, label: current.uuid }],
                      },
                    ]),
                  );
                  setTabMultiple([
                    { contentId: "host-hardware-divices", newKey: "host.lun" },
                    { contentId: "host.lun", newKey: LunTypeEnum.NVMe },
                  ]);
                }}
              >
                {current.name}
              </a>
            </Text>
          );
        }
        return (
          <Text>
            <TableDetailLink currentRow={current}>
              {current.name}
            </TableDetailLink>
          </Text>
        );
      },
    },
    {
      key: "size",
      formatter: ({ size = 0 }) => formatStorage(size, 2),
    },
  ]);
};
