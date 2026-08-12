import { useActionConfig } from "@zstack/zsphere-engine/src/fiber-channel-lun";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { refreshFiberChannelStorages } from "../../../gql/fiber-channel-storage.gql";

export default () => {
  const intl = useIntl();
  const { currentZone } = usePlatformStore();
  const doAction = useAction();

  return useActionConfig<IFiberChannelLun>([
    {
      key: "sync.fclun.info",
      onClick: ({ refetch, selectedList }) => {
        doAction({
          mutation: refreshFiberChannelStorages,
          payload: {
            zoneUuid: currentZone?.uuid,
            scsiLunUuids: selectedList?.map((it) => it.uuid),
          },
          type: "FiberChannelStorage",
          name: intl.formatMessage({
            id: "sync.fclun.info",
            defaultMessage: "Sync LUN Info",
          }),
          total: 1,
          onFinish: () => {
            refetch?.();
          },
        });
      },
    },
  ]);
};
