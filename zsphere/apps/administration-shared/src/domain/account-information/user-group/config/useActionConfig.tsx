import { useActionConfig } from "@zstack/zsphere-engine/src/zsv-user-group";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";

export default () => {
  return useActionConfig<IUserGroup>([]);
};
