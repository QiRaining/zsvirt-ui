import { useActionConfig } from "@zstack/zsphere-engine/src/account-information";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";

export default () => {
  return useActionConfig<IAccount>([]);
};
