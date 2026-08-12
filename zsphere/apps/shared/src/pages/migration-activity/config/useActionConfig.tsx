import { useActionConfig } from "@zstack/zsphere-engine/src/scheduling-information";
import type { IOption } from "@zstack/zsphere-engine/src/scheduling-information/useActionConfig";

export default () => {
  const options: IOption<any> = [];

  return useActionConfig(options);
};
