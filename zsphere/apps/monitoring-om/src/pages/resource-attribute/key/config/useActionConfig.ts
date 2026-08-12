import { useActionConfig } from "@zstack/zsphere-engine/src/resource-attribute-key";

export default () => {
  return useActionConfig([
    {
      key: "create",
      primary: true,
      autoInjectPreValidator: false,
      ActionWrapper: require("../action/create").default,
    },
    {
      key: "edit",
      ActionWrapper: require("../action/edit").default,
    },
    {
      key: "delete",
      ActionWrapper: require("../action/delete").default,
    },
    {
      key: "add.value",
      ActionWrapper: require("../../constraint/action/create").default,
    },
  ]);
};
