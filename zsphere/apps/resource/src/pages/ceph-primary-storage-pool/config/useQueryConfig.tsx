import { useQueryConfig } from "@zstack/zsphere-engine/src/ceph-primary-storage-pool";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "CephPrimaryStoragePool",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
