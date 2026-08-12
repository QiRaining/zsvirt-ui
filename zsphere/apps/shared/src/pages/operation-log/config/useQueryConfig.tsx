import { useQueryConfig } from "@zstack/zsphere-engine/src/operation-log";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default ({
  view = "",
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  const filteredKeys = view === "sub.current" ? ["name"] : undefined;
  const queryProps: IQueryProps = {
    resourceType: "OperationLog",
    needFuzzyQuery: true,
    defaultQuery,
    filteredKeys,
  };

  return useQueryConfig([], queryProps);
};
