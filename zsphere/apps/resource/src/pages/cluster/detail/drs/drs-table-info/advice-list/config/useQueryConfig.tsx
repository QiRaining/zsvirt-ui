import { useQueryConfig } from "@zstack/zsphere-engine/src/scheduling-information";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery: any) => {
  const queryProps: IQueryProps = {
    resourceType: "SehedulingInformation",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "advice.migration.vm",
        searchKey: "vm",
      },
      {
        key: "advice.target.host",
        searchKey: "target.host",
      },
    ],
    queryProps,
  );
};
