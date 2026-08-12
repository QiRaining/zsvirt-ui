import { useColumnConfig } from "@zstack/zsphere-engine/src/nvme-controller";

export default () => {
  return useColumnConfig([
    {
      key: "subsystem",
      formatter: (current) => current.nqn,
    },
    {
      key: "transport",
      formatter: (current) =>
        current.transport ? current.transport.toUpperCase() : "",
    },
  ]);
};
