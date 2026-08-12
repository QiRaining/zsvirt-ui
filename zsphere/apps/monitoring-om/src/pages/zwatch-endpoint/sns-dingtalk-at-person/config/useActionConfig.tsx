import { useActionConfig } from "@zstack/zsphere-engine/src/sns-dingtalk-at-person";
import type { SNSDingTalkAtPerson } from "@zstack/zsphere-types/graphql";

import { verifyMultiSelect } from "../action/validator";

export default () => {
  const config = useActionConfig<SNSDingTalkAtPerson>([
    {
      key: "add.notify.person",
      ActionWrapper: require("../action/add-at-pserson").default,
      autoInjectPreValidator: false,
      icon: "plus",
    },
    {
      key: "delete.notify.person",
      preValidators: [verifyMultiSelect],
      ActionWrapper: require("../action/remove-at-pserson").default,
      icon: "trash",
    },
    {
      key: "update.notify.person",
      ActionWrapper: require("../action/update-at-pserson").default,
    },
  ]);

  return config;
};
