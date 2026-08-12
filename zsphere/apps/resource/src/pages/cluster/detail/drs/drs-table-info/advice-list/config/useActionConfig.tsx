import { useActionConfig } from "@zstack/zsphere-engine/src/scheduling-information";
import type { IOption } from "@zstack/zsphere-engine/src/scheduling-information/useActionConfig";

import { verifyExecuteDispatch } from "../action/validator";

export default () => {
  const options: IOption<any> = [
    {
      key: "execute.dispatch",
      autoInjectPreValidator: false,
      preValidators: [verifyExecuteDispatch],
      ActionWrapper: require("../action/activity-modal").default,
    },
  ];

  return useActionConfig(options);
};
