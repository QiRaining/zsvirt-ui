import CreatePrimaryStorage from "@zstack/virtualization-resource/src/pages/primary-storage/create";
import { useActionConfig } from "@zstack/zsphere-engine/src/fiber-channel-storage";
import { useAction } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";

import { refreshFiberChannelStorages } from "../../../gql/fiber-channel-storage.gql";

export default () => {
  const intl = useIntl();
  const { currentZone } = usePlatformStore();
  const doAction = useAction();

  return useActionConfig<IFiberChannelStorage>([
    {
      key: "refresh.fiber.channel.storage",
      icon: "sync",
      autoInjectPreValidator: false,
      onClick: ({ refetch, source }) => {
        doAction({
          mutation: refreshFiberChannelStorages,
          payload: {
            zoneUuid:
              source?.__typename === "Zone" ? source?.uuid : currentZone?.uuid,
          },
          type: "FiberChannelStorage",
          name: intl.formatMessage({
            id: "refresh.fiber.channel.storage",
            defaultMessage: "Sync Device Info",
          }),
          total: 1,
          onFinish: () => {
            refetch?.();
          },
        });
      },
    },
    {
      key: "add.data.storage",
      ActionWrapper: CreatePrimaryStorage,
    },
  ]);
};
