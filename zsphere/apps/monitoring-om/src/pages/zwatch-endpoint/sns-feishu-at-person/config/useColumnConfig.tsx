import { useColumnConfig } from "@zstack/zsphere-engine/src/sns-feishu-at-person";
import type { SNSFeiShuAtPerson } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<SNSFeiShuAtPerson>([]);
};
