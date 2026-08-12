import { useQueryConfig } from "@zstack/zsphere-engine/src/vm-template";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "VmInstance",
    needFuzzyQuery: true,
    defaultQuery,
  };

  const config = useQueryConfig(
    [
      {
        key: "name",
        searchKey: "name",
      },
    ],
    queryProps,
  );

  return config.filter(({ _key, type }) => type !== "tag");
};
