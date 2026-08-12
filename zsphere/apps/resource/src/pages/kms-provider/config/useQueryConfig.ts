import { useQueryConfig } from "@zstack/zsphere-engine/src/kms-provider";
import type { IQuery } from "@zstack/zsphere-types";

export default ({ defaultQuery }: { defaultQuery?: IQuery } = {}) => {
  return useQueryConfig([], {
    defaultQuery: defaultQuery as any,
    needFuzzyQuery: true,
    resourceType: "KmsProvider",
  });
};
