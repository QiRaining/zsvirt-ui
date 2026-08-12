import { useColumnConfig } from "@zstack/zsphere-engine/src/sns-dingtalk-at-person";
import type { SNSDingTalkAtPerson } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<SNSDingTalkAtPerson>([]);
};
