import { useAuth } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/vm";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useIntl } from "react-intl";

export default ({
  view = "",
  defaultQuery,
}: {
  view?: string;
  defaultQuery?: any;
}) => {
  const intl = useIntl();
  const { currentUser } = usePlatformStore();
  const { hasAuth } = useAuth();

  let filteredKeys: string[] | undefined = [
    "uuid",
    "name",
    "group",
    "owner",
    "hostIp",
    "host",
    "defaultIpv4",
    "defaultMac",
    "tag",
  ];

  const excludeKeys = [];

  if (
    [
      "sub.virtualization.vm-scheduling-rule",
      "sub.virtualization.vm-group",
    ].includes(view)
  ) {
    excludeKeys.push("tentant", "admin"); //  "tentant" 应为 "tenant"（租户）。此拼写错误 从后端来源，似乎就是错的，估计先不修改
  } else if (view === "sub.virtualization.zone.recyle") {
    excludeKeys.push("defaultIpv4", "hostIp", "defaultMac");
  }

  if (view) {
    if (
      [
        "sub.auto.scaling",
        "select",
        "select.create.scheduled.job",
        "select.vm.tag",
      ].includes(view)
    ) {
      filteredKeys = ["uuid", "name", "group"];
    }
    if (view.includes("export")) {
      filteredKeys = ["name"];
    }
    if (view.includes("sub.zsv.vm.template")) {
      filteredKeys = ["name"];
    }

    if (["sub.virtualization.tag", "select.virtualization"].includes(view)) {
      filteredKeys = [
        "uuid",
        "name",
        "group",
        "owner",
        "hostIp",
        "host",
        "defaultIpv4",
        "defaultMac",
      ];
    }
  }

  const queryProps: IQueryProps = {
    defaultQuery,
    resourceType: "VmInstance",
    needFuzzyQuery: true,
    filteredKeys,
    excludeKeys,
    currentUser,
  };

  const haveGroupAuth = hasAuth({
    type: "block",
    authKey: "vm.directory.tree",
    resource: "vm",
  });

  const config = useQueryConfig(
    [
      {
        key: "owner",
        searchKey: "ownerName",
      },
      {
        key: "hostIp",
        searchKey: "host.managementIp",
      },
      {
        key: "host",
        searchKey: "__HostName__",
      },
      {
        label: intl.formatMessage({
          id: "ip.address",
          defaultMessage: "IP Address",
        }),
        key: "defaultIpv4",
        searchKey: "vmNics.usedIp.ip",
      },
      {
        label: intl.formatMessage({
          id: "ipv6Address",
          defaultMessage: "IPv6 Address",
        }),
        key: "defaultIpv6",
        searchKey: "vmNics.usedIp.ip",
      },
      {
        label: intl.formatMessage({
          id: "mac.address",
          defaultMessage: "MAC Address",
        }),
        key: "defaultMac",
        searchKey: "vmNics.mac",
      },
      {
        key: "eip",
        searchKey: "vmNics.eip.vipIp",
      },
      {
        key: "group",
        searchKey: "groupPath",
      },
    ],
    queryProps,
  );

  return config.filter(({ key }) => haveGroupAuth || key !== "group");
};
