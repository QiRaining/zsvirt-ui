import { useQueryConfig } from "@zstack/zsphere-engine/src/bond";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (queryProps?: IQueryProps) => {
  return useQueryConfig(
    [
      {
        key: "name",
        searchKey: "bondingName",
      },
      {
        key: "host",
        searchKey: "hostName",
      },
    ],
    queryProps,
  );
};
