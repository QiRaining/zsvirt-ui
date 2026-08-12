import { useColumnConfig } from "@zstack/zsphere-engine/src/ceph-mon";
import { MonStatus as IMonStatus } from "@zstack/zsphere-types";
import type { CephMon as ICephMon } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<ICephMon>([
    {
      key: "status",
      filterOptions: IMonStatus,
    },
  ]);
};
