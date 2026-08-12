import { Text, Badge } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/snapshot";
import type { IOption } from "@zstack/zsphere-engine/src/snapshot/useColumnConfig";
import { SnapshotType } from "@zstack/zsphere-types";
import type { VolumeSnapshot as IVolumeSnapshot } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { useMemo, useContext } from "react";
import { useIntl } from "react-intl";

import { SnapshotContext } from "../hooks";

export default () => {
  const intl = useIntl();
  const { store, setStore } = useContext(SnapshotContext);

  const option: IOption<IVolumeSnapshot> = useMemo(
    () => [
      {
        key: "name",
        render: ({ snapshotType, name, group, uuid, latest, current }) => {
          if (snapshotType === SnapshotType.Group) {
            return (
              <div className="flex items-center">
                <Text key={uuid} className="min-w-0 flex-1">
                  <a
                    onClick={() => {
                      setStore({
                        ...store,
                        snapshotUuid: group?.uuid,
                        snapshotType,
                      });
                    }}
                  >
                    {group?.name || ""}
                  </a>
                </Text>
                {latest && current && (
                  <Badge
                    variant="outline"
                    className="ml-2 shrink-0"
                    count={intl.formatMessage({
                      id: "current",
                      defaultMessage: "Current",
                    })}
                  />
                )}
              </div>
            );
          }
          return (
            <div className="flex items-center">
              <Text key={uuid} className="min-w-0 flex-1">
                <a
                  onClick={() => {
                    setStore({
                      ...store,
                      snapshotUuid: uuid,
                      snapshotType,
                    });
                  }}
                >
                  {name || ""}
                </a>
              </Text>
              {latest && current && (
                <Badge
                  variant="outline"
                  className="ml-2 shrink-0"
                  count={intl.formatMessage({
                    id: "current",
                    defaultMessage: "Current",
                  })}
                />
              )}
            </div>
          );
        },
      },
      {
        key: "memoryInFormation",
        filters: [
          {
            text: intl.formatMessage({ id: "yes", defaultMessage: "Yes" }),
            value: "true",
          },
          {
            text: intl.formatMessage({ id: "no", defaultMessage: "No" }),
            value: "false",
          },
        ],
        render: ({ group }) => {
          const { volumeSnapshotRefs = [] } = group || {};
          const haveMemorySnapshot: boolean = volumeSnapshotRefs.some(
            (it: { volumeType: string }) => it.volumeType === "Memory",
          );
          return haveMemorySnapshot
            ? intl.formatMessage({ id: "yes", defaultMessage: "Yes" })
            : intl.formatMessage({ id: "no", defaultMessage: "No" });
        },
      },
      /**
       * 由于ceph存储特性，没法直接获取size
       * 需通过getVolumeSnapshotSizeAction 获取actualSize
       */
      {
        key: "size",
        formatter: ({
          snapshotType,
          size,
          group,
          primaryStorage,
          actualSize,
        }) => {
          const _size =
            (snapshotType === SnapshotType.Group ? group?.totalSize : size) ??
            0;
          return primaryStorage?.type === "Ceph" &&
            snapshotType !== SnapshotType.Group
            ? formatStorage(actualSize! ?? 0, 2)
            : formatStorage(_size, 2);
        },
      },
    ],
    [intl, store],
  );

  return useColumnConfig<IVolumeSnapshot>(option);
};
