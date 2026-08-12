import { useQueryConfig } from "@zstack/zsphere-engine/src/zwatch-sns-text-template";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    needFuzzyQuery: true,
    resourceType: "SNSTextTemplate",
    defaultQuery,
  });
};
