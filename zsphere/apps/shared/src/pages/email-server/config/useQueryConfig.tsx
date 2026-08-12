import { useQueryConfig } from "@zstack/zsphere-engine/src/email-server";

export default () => {
  return useQueryConfig([], {
    resourceType: "emailServerSetting",
    needFuzzyQuery: true,
  });
};
