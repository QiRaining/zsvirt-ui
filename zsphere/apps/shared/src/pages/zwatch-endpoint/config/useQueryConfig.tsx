import { useQueryConfig } from "@zstack/zsphere-engine/src/zwatch-endpoint";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "EndPoint",
    needFuzzyQuery: true,
  };
  return useQueryConfig(
    [
      {
        key: "owner",
        searchKey: "ownerName",
      },
    ],
    queryProps,
  );
};
