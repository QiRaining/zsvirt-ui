import { useQueryConfig } from "@zstack/zsphere-engine/src/image";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default ({
  view,
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  let filteredKeys: string[] | undefined;

  if (view) {
    if (view.includes("export")) {
      filteredKeys = ["name"];
    }
  }

  const queryProps: IQueryProps = {
    resourceType: "Image",
    needFuzzyQuery: true,
    filteredKeys,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "owner",
        searchKey: "ownerName",
      },
      {
        key: "backupStorage",
        searchKey: "backupStorage.name",
      },
    ],
    queryProps,
  );
};
