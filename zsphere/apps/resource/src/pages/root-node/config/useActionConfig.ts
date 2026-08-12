import CreateModal from "@zstack/virtualization-resource/src/pages/zone/action/create-modal";
import { useActionConfig } from "@zstack/zsphere-engine/src/root-node";
import type { IOption } from "@zstack/zsphere-engine/src/root-node/useActionConfig";
import type { Item } from "@zstack/zsphere-types";
import { useMemo } from "react";

import TreeSettings from "../action/tree-settings";

export default () => {
  const actionConfig: IOption<Item> = useMemo<IOption<Item>>(
    () => [
      {
        key: "create",
        ActionWrapper: CreateModal,
      },
      {
        key: "resource.tree.settings",
        ActionWrapper: TreeSettings,
      },
    ],
    [],
  );

  const config = useActionConfig<Item>(actionConfig);

  return config;
};
