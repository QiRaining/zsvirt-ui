import { useColumnConfig } from "@zstack/zsphere-engine/src/iscsi-server";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<IIscsiServer>([
    {
      key: "name",
    },
    {
      key: "state",
      filterOptions: {
        Enabled: "Enabled",
        Disabled: "Disabled",
      },
    },
    {
      key: "iqn.count",
      formatter: ({ iscsiTargets = [] }) => iscsiTargets?.length,
    },
  ]);
};
