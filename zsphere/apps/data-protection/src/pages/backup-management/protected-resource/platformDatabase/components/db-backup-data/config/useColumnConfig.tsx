import { Text } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { useColumnConfig } from "@zstack/zsphere-engine/src/db-backup-data";
import type { BackupDataFormImageStorage } from "@zstack/zsphere-types/graphql";

export default () => {
  const { getServerTime } = useTime();

  return useColumnConfig<BackupDataFormImageStorage>([
    {
      key: "name",
      render: (current) => <Text>{current?.name}</Text>,
    },
    {
      key: "version",
      render: (current) => current?.version,
    },
    {
      key: "createDate",
      render: (current) =>
        getServerTime(current.createdTime).format("YYYY-MM-DD HH:mm:ss"),
    },
  ]);
};
