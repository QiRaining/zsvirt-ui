import { useActionConfig } from "@zstack/zsphere-engine/src/zsv-user-group";

import Recall from "../../action/recall";
import Shared from "../../action/shared";
import DeleteUserGroup from "../../user-group/action/delete-userGroup";

export default () => {
  return useActionConfig([
    {
      key: "virtualization.delete",
      ActionWrapper: DeleteUserGroup,
    },
    {
      key: "share",
      autoInjectPreValidator: false,
      ActionWrapper: Shared,
    },
    {
      key: "recall",
      ActionWrapper: Recall,
    },
  ]);
};
