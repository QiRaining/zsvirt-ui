import { useQueryConfig } from "@zstack/zsphere-engine/src/vhost-primary-storage-pool";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "VHostPrimaryStoragePool",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
