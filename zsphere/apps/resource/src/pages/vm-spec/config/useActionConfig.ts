import { useActionConfig } from "@zstack/zsphere-engine/src/vm-spec";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";

export default () => {
  return useActionConfig<VmCustomSpecification>([
    {
      key: "virtualization.create.vm.spec",
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "virtualization.edit.name.desc",
      ActionWrapper: require("../action/edit-name-desc").default,
    },
    {
      key: "virtualization.edit.config",
      ActionWrapper: require("../action/edit-config").default,
    },
    {
      key: "virtualization.delete",
      ActionWrapper: require("../action/delete").default,
    },
  ]);
};
