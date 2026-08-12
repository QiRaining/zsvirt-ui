import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/snapshot-group";
import { SnapshotFormat, SnapshotGroupType } from "@zstack/zsphere-types";
import type { VolumeSnapshot as IVolumeSnapshot } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";

export default () =>
  useColumnConfig<IVolumeSnapshot>([
    {
      key: "snapshotName",
      render: ({ name }) => {
        return <Text>{name}</Text>;
      },
    },
    {
      key: "volumeName",
      render: ({ volume }) => {
        return <Text>{volume.name}</Text>;
      },
    },
    {
      key: "size",
      formatter: ({ size }) => formatStorage(size ?? 0, 2),
    },
    {
      key: "format",
      filterOptions: SnapshotFormat,
    },
    {
      key: "type",
      filterOptions: SnapshotGroupType,
    },
    {
      key: "installPath",
      formatter: ({ primaryStorageInstallPath }) => primaryStorageInstallPath,
    },
  ]);
