import { useQueryConfig } from "@zstack/zsphere-engine/src/vm-nic";
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
    if (["select.server-group", "sub.sg", "select.sg"].includes(view)) {
      filteredKeys = ["vmName", "ipv4", "ipv6"];
    }
    if (["sub"].includes(view)) {
      filteredKeys = ["name", "mac", "ipv4", "ipv6"];
    }
    if (["sub.node"].includes(view)) {
      filteredKeys = ["name", "mac", "ipv4"];
    }
    if (["sub.vcenter"].includes(view)) {
      filteredKeys = ["name", "vmName", "ipv4", "mac", "nicName"];
    }
  }

  const queryProps: IQueryProps = {
    defaultQuery,
    resourceType: "VmNic",
    needFuzzyQuery: true,
    filteredKeys,
  };

  return useQueryConfig(
    [
      {
        key: "vmName",
        searchKey: "vmInstance.name",
      },
      {
        key: "nicName",
        searchKey: "internalName",
      },
      {
        key: "name",
        searchKey: "internalName",
      },
      {
        key: "ip.address",
        searchKey: "ip",
      },
    ],
    queryProps,
  );
};
