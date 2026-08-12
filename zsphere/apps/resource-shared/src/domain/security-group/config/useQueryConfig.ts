import { useQueryConfig as _useQueryConfig } from "@zstack/zsphere-engine/src/security-group";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import { cloneDeep } from "lodash-es";

function useQueryConfig({
  _view,
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) {
  const queryProps: IQueryProps = {
    defaultQuery,
    resourceType: "SecurityGroup",
    needFuzzyQuery: true,
  };

  const _queryConfig = _useQueryConfig(
    [
      {
        key: "owner",
        searchKey: "ownerName",
      },
    ],
    queryProps,
  );

  const queryConfig = cloneDeep(_queryConfig);

  return queryConfig;
}

export default useQueryConfig;
