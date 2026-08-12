import { useQueryConfig } from "@zstack/zsphere-engine/src/endpoint-sms-address";

export default () => {
  return useQueryConfig([
    {
      key: "phoneNumber",
      searchKey: "receivers.phoneNumber",
    },
  ]);
};
