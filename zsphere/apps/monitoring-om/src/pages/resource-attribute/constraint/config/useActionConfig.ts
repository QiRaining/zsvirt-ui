import { useActionConfig } from "@zstack/zsphere-engine/src/resource-attribute-constraint";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";

export default () => {
  const config = useActionConfig<ResourceAttributeConstraint>([
    {
      key: "create",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "delete",
      ActionWrapper: require("../action/delete").default,
    },
  ]);
  return {
    ...config,
    getItemName: (item: ResourceAttributeConstraint) => item.parameter,
  };
};
