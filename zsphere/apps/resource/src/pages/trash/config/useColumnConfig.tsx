import { useColumnConfig } from "@zstack/zsphere-engine/src/trash";
import { TrashType } from "@zstack/zsphere-types";
import type { Trash as ITrash } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();

  return useColumnConfig<ITrash>([
    {
      key: "uuid",
      formatter: (current: ITrash) => current?.resourceUuid,
    },
    {
      key: "size",
      formatter: (current: ITrash) => formatStorage(current?.size || 0, 2),
    },
    {
      key: "trashType",
      formatter: (current: ITrash) => {
        switch (current?.trashType) {
          case TrashType.RevertVolume:
            return intl.formatMessage({
              id: "revertVolume",
              defaultMessage: "Recover Volume",
            });
          case TrashType.MigrateImage:
          case TrashType.MigrateVolume:
          case TrashType.MigrateVolumeSnapshot:
            return intl.formatMessage({
              id: "storageMigrate",
              defaultMessage: "Migrate Storage",
            });
          default:
            return current?.trashType;
        }
      },
    },
  ]);
};
