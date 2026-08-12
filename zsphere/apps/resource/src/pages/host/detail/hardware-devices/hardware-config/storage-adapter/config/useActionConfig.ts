import { useActionConfig } from "@zstack/zsphere-engine/src/storage-adapter";

export default () => {
  return useActionConfig([
    {
      key: "virtualization.edit",
      ActionWrapper: require("../action/edit").default,
    },
  ]);
};
