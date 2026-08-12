import { useColumnConfig } from "@zstack/zsphere-engine/src/script-list";
import { ImagePlatform, ScriptType } from "@zstack/zsphere-types";
import type { Script as IScript } from "@zstack/zsphere-types/graphql";
import * as _ from "lodash-es";

export default () => {
  return useColumnConfig<IScript>([
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-monitoring-om",
        path: "script-library/script-list",
      },
    },
    {
      key: "platform",
      filterOptions: _.pick(ImagePlatform, [
        ImagePlatform.Linux,
        ImagePlatform.Windows,
      ]),
    },
    {
      key: "scriptType",
      filterOptions: ScriptType,
    },
  ]);
};
