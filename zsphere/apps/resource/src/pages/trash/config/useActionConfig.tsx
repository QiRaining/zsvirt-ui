import { useActionConfig } from "@zstack/zsphere-engine/src/trash";
import type { Trash as ITrash } from "@zstack/zsphere-types/graphql";

import { verifyCleanup } from "../action/validator";

export default () => {
  return useActionConfig<ITrash>([
    {
      key: "primary.storage.cleanup",
      preValidators: [verifyCleanup],
      ActionWrapper: require("../action/cleanup-modal").default,
    },
    {
      key: "backup.storage.cleanup",
      preValidators: [verifyCleanup],
      ActionWrapper: require("../action/cleanup-modal").default,
    },
  ]);
};
