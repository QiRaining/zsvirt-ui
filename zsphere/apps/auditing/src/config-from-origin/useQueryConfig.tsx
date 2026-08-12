import { useQueryConfig } from "@zstack/zsphere-engine/src/auditing";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default ({
  view = "",
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  const viewMap: Map<string, string[]> = new Map([
    ["virtualization.sub", ["apiName", "clientIpForResource", "resourceName"]],
    [
      "virtualization.main.resource",
      [
        "resourceType",
        "resourceUuid",
        "apiName",
        "clientIpForResource",
        "resourceName",
      ],
    ],
    [
      "virtualization.main.login",
      ["apiName", "operatorAccountName", "clientIp", "clientBrowser"],
    ],
    ["sub", ["apiName", "operatorAccountName"]],
    [
      "main.resource",
      ["resourceType", "resourceUuid", "apiName", "operatorAccountName"],
    ],
    [
      "main.login",
      ["apiName", "operatorAccountName", "clientIp", "clientBrowser"],
    ],
  ]);

  const queryProps: IQueryProps = {
    resourceType: "Audit",
    needFuzzyQuery: view as any, // needFuzzyQuery === true (触发 engine 代码里的 useEffect)
    defaultQuery,
    filteredKeys: viewMap.get(view),
  };

  return useQueryConfig(
    [{ key: "clientIpForResource", searchKey: "clientIp" }],
    queryProps,
  );
};
