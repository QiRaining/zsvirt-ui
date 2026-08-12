import { useQueryConfig } from "@zstack/zsphere-engine/src/tag";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default ({
  view,
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  const queryProps: IQueryProps = {
    resourceType: "Tag",
    needFuzzyQuery: true,
    defaultQuery,
  };

  const config = useQueryConfig(
    [
      {
        key: "owner",
        searchKey: "ownerName",
      },
    ],
    queryProps,
  );

  if (view) {
    if (["select"].includes(view)) {
      return config.filter((item) => item.key !== "owner");
    }
  }
  return config;
};
