import { useActionConfig } from "@zstack/zsphere-engine/src/nvme";
import type { NvmeServer as INvmeServer } from "@zstack/zsphere-types/graphql";

export default () => {
  return useActionConfig<INvmeServer>([
    {
      key: "virtualization.add.data.storage",
      ActionWrapper:
        require("@zstack/virtualization-resource/src/pages/primary-storage/create")
          .default,
    },
    {
      key: "virtualization.add.nvmeStorage",
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "virtualization.attach.cluster",
      ActionWrapper: require("../action/attach-cluster-modal").default,
    },
    {
      key: "virtualization.sync.data",
      ActionWrapper: require("../action/sync-data").default,
    },
    {
      key: "virtualization.delete",
      ActionWrapper: require("../action/delete").default,
    },
    {
      key: "virtualization.edit.name",
      ActionWrapper: require("../action/edit-name").default,
    },
  ]);
};
