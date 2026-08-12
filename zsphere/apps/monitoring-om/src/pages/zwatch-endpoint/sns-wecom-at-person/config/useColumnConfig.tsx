import { useColumnConfig } from "@zstack/zsphere-engine/src/sns-wecom-at-person";
import type { SNSWeComAtPerson } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<SNSWeComAtPerson>([]);
};
