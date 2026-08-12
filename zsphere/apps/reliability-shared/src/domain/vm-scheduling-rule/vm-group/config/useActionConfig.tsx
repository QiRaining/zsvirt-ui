import { useActionConfig } from "@zstack/zsphere-engine/src/vm-group";
import type { VmGroup } from "@zstack/zsphere-types/graphql";

export default () => {
  return useActionConfig<VmGroup>([]);
};
