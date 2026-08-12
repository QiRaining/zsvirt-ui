import { gql, useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { TagList, ResourceName, Link } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import { useColumnConfig } from "@zstack/zsphere-engine/src/ip-statistic";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type {
  IpStatistics as IIpStatistics,
  L3Network,
} from "@zstack/zsphere-types/graphql";
import { get } from "lodash-es";
import qs from "qs";
import React, { useMemo, useCallback } from "react";
import { useIntl } from "react-intl";

import styles from "./style.module.less";

const QUERY_GATEWAY_VM_UUIDS = gql`
  query queryGatewayVmInstanceList {
    gatewayVmInstanceList(replyWithCount: false, type: "includeFirstGateway") {
      list {
        uuid
      }
    }
  }
`;

interface IResourceLink {
  uuidKey: string;
  nameKey: string;
  link: string;
  microAppName: string;
  leftNav?: LeftNavType;
  navView?: NavView;
}

export default (source?: L3Network) => {
  const searchObj = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const currentNavView = (searchObj?.navView as string) || "notGroup";
  const intl = useIntl();

  // 获取迁移网关虚拟机 UUID 列表
  const { data: gatewayVmData } = useQuery(QUERY_GATEWAY_VM_UUIDS, {
    fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  });
  const gatewayVmUuids = useMemo(
    () =>
      new Set(
        (gatewayVmData?.gatewayVmInstanceList?.list ?? []).map(
          (vm: { uuid: string }) => vm.uuid,
        ),
      ),
    [gatewayVmData],
  );

  const resourceTypeIntl = useMemo<Record<string, string>>(
    () => ({
      Vip: intl.formatMessage({ id: "vip", defaultMessage: "VIP" }),
      VpcVRouter: intl.formatMessage({
        id: "vpcRouter",
        defaultMessage: "VPC vRouter",
      }),
      VRouter: intl.formatMessage({
        id: "vpcRouter",
        defaultMessage: "VPC vRouter",
      }),
      VM: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
      templatedVmInstance: intl.formatMessage({
        id: "ip.statistics.resource.type.vm.template",
        defaultMessage: "Template",
      }),
      SLB: intl.formatMessage({
        id: "loadBalancer",
        defaultMessage: "Load Balancer",
      }),
      baremetal2: intl.formatMessage({
        id: "baremetal2.instance",
        defaultMessage: "Elastic Baremetal Instance",
      }),
      DHCP: intl.formatMessage({ id: "DHCP", defaultMessage: "DHCP" }),
      KernelInterface: intl.formatMessage({
        id: "zskernel",
        defaultMessage: "Kernel Adapter",
      }),
    }),
    [intl],
  );

  const resourceLinkMap = useMemo<Record<string, IResourceLink>>(
    () => ({
      Vip: {
        uuidKey: "vipUuid",
        nameKey: "vipName",
        link: "/vip",
        microAppName: "network-service",
      },
      VpcVRouter: {
        uuidKey: "vmInstanceUuid",
        nameKey: "vmInstanceName",
        link: "/vpc-vrouter",
        microAppName: "network-resource",
      },
      VRouter: {
        uuidKey: "vmInstanceUuid",
        nameKey: "vmInstanceName",
        link: "/vpc-vrouter",
        microAppName: "network-resource",
      },
      VM: {
        uuidKey: "vmInstanceUuid",
        nameKey: "vmInstanceName",
        link: "/vm",
        microAppName: "virtualization-resource",
        leftNav: LeftNavType.ClusterHost,
      },
      templatedVmInstance: {
        uuidKey: "vmInstanceUuid",
        nameKey: "vmInstanceName",
        link: "/vm-template",
        microAppName: "virtualization-resource",
        leftNav: LeftNavType.TemplateVm,
        navView: NavView.Template,
      },
      SLB: {
        uuidKey: "applianceVmOwnerUuid",
        nameKey: "vmInstanceName",
        link: "/load-balancer",
        microAppName: "network-service",
      },
      baremetal2: {
        uuidKey: "vmInstanceUuid",
        nameKey: "vmInstanceName",
        link: "/baremetal2-instance",
        microAppName: "elastic-baremetal",
      },
      KernelInterface: {
        uuidKey: "hostKernelInterface.host.uuid",
        nameKey: "hostKernelInterface.host.name",
        link: "/host",
        microAppName: "virtualization-resource",
        leftNav: LeftNavType.ClusterHost,
        navView: NavView.Resource,
      },
    }),
    [],
  );

  const noneFlag = <span className={styles["null-text"]}>-</span>;

  const renderIp = useCallback(
    (ip: string) => <CopyableText>{ip}</CopyableText>,
    [],
  );

  return useColumnConfig<IIpStatistics>([
    {
      key: "resourceTypes",
      gqlKey: ["resourceTypes", "vmInstanceType"],
      width: 200,
      render: (value: IIpStatistics) => {
        let resourceTypes: string[];
        if (value.templatedVmInstance) {
          resourceTypes = ["templatedVmInstance"];
        } else if (value.resourceTypes?.length) {
          resourceTypes = value.resourceTypes;
        } else if (value.vmInstanceType) {
          resourceTypes = [value.vmInstanceType];
        } else {
          return noneFlag;
        }
        return (
          <TagList
            tags={resourceTypes.map((type) => {
              const name = resourceTypeIntl[type] ?? type;
              return { uuid: name, name };
            })}
          />
        );
      },
      exportToCSVRender: (value) => {
        let resourceTypes: string[];
        if (value.templatedVmInstance) {
          resourceTypes = ["templatedVmInstance"];
        } else if (value.resourceTypes?.length) {
          resourceTypes = value.resourceTypes;
        } else if (value.vmInstanceType) {
          resourceTypes = [value.vmInstanceType];
        } else {
          return "";
        }
        return resourceTypes
          .map((type) => resourceTypeIntl[type] ?? type)
          .join("、");
      },
      filterMultiple: false,
      filters: [
        {
          text: intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" }),
          value: "VM",
        },
        {
          text: intl.formatMessage({
            id: "zskernel",
            defaultMessage: "Kernel Adapter",
          }),
          value: "KernelInterface",
        },
      ],
    },
    {
      key: "ipv4Adress",
      gqlKey: ["ip"],
      sortKey: "ip",
      width: 200,
      render: (value) =>
        value.ip?.includes(".") ? renderIp(value.ip) : noneFlag,
    },
    {
      key: "vmInstanceName",
      gqlKey: [
        "resourceTypes",
        "vmInstanceType",
        "vipUuid",
        "vmInstanceUuid",
        "vmInstanceName",
        "vipName",
        "resourceOwnerUuid",
      ],
      width: 200,
      render: (value: IIpStatistics) => {
        let resourceTypes: string[];
        if (value.templatedVmInstance) {
          resourceTypes = ["templatedVmInstance"];
        } else if (value.resourceTypes?.length) {
          resourceTypes = value.resourceTypes;
        } else if (value.vmInstanceType) {
          resourceTypes = [value.vmInstanceType];
        } else {
          return null;
        }

        const list = resourceTypes.reduce<React.ReactNode[]>(
          (acc, cur, index) => {
            const uuid = get(value, "vmInstanceUuid") || get(value, "vipUuid");

            // 迁移网关虚拟机跳转到迁移服务-服务管理页面
            if (cur === "VM" && uuid && gatewayVmUuids.has(uuid)) {
              const title = get(value, "vmInstanceName", "vmInstanceName");
              if (index >= 1) {
                acc.push(<span key={index}>、</span>);
              }
              acc.push(
                <Text key={cur} value={title}>
                  <Link
                    isRouterManaged
                    to="/migration-service?tab=overview"
                    microAppName="virtualization-monitoring-om"
                    keepState={false}
                  >
                    {title}
                  </Link>
                </Text>,
              );
              return acc;
            }

            const resourceLink = resourceLinkMap[cur];
            if (!resourceLink) {
              return acc;
            }
            const linkUuid = get(value, resourceLink.uuidKey);
            if (!linkUuid) {
              return acc;
            }
            if (index >= 1) {
              acc.push(<span key={index}>、</span>);
            }
            const title = get(
              value,
              resourceLink.nameKey,
              resourceLink.nameKey,
            );
            acc.push(
              <ResourceName
                key={cur}
                value={title}
                link={{
                  to: resourceLink.link,
                  microAppName: resourceLink.microAppName,
                  uuid: linkUuid,
                  leftnav: resourceLink.leftNav,
                  navView: resourceLink.navView ?? currentNavView,
                  keepState: false,
                }}
              />,
            );
            return acc;
          },
          [],
        );

        return list.length ? list : null;
      },
      exportToCSVRender: (value) => {
        let resourceTypes: string[];
        if (value.templatedVmInstance) {
          resourceTypes = ["templatedVmInstance"];
        } else if (value.resourceTypes?.length) {
          resourceTypes = value.resourceTypes;
        } else if (value.vmInstanceType) {
          resourceTypes = [value.vmInstanceType];
        } else {
          return "";
        }
        return resourceTypes
          .map((type) => {
            const resourceLink = resourceLinkMap[type];
            if (!resourceLink || !get(value, resourceLink.uuidKey)) {
              return null;
            }
            return get(value, resourceLink.nameKey, resourceLink.nameKey);
          })
          .filter((name) => name)
          .join("、");
      },
    },
    {
      key: "nic",
      render: (value: IIpStatistics) => {
        const instance = value.templatedVmInstance ?? value.vmInstance;
        const name = value.hostKernelInterface
          ? "-"
          : instance?.vmNics?.find((nic) =>
              nic.usedIps?.find((ip) => ip.ip === value.ip),
            )?.internalName;
        return name ? <Text>{name}</Text> : null;
      },
    },
    {
      key: "mac.address",
      render: (value: IIpStatistics) => {
        const instance = value.templatedVmInstance ?? value.vmInstance;
        const mac = instance?.vmNics?.find((nic) =>
          nic.usedIps?.find((ip) => ip.ip === value.ip),
        )?.mac;
        return mac ? <CopyableText>{mac}</CopyableText> : null;
      },
    },
    {
      key: "ipv6Adress",
      gqlKey: "ip",
      sortKey: "ip",
      sorter: true,
      width: 200,
      render: (value) =>
        value.ip?.includes(".") ? noneFlag : renderIp(value.ip),
      auth: {
        type: "block",
        resource: `${source?.networkType}.network`,
        authKey: "ipv6",
      },
    },
    {
      key: "ipVersion",
      filters: [
        {
          text: intl.formatMessage({ id: "IPv4", defaultMessage: "IPv4" }),
          value: 4,
        },
        {
          text: intl.formatMessage({ id: "IPv6", defaultMessage: "IPv6" }),
          value: 6,
        },
      ],
      formatter: (current) =>
        current.ip &&
        (current.ip.includes(":")
          ? intl.formatMessage({ id: "IPv6", defaultMessage: "IPv6" })
          : intl.formatMessage({ id: "IPv4", defaultMessage: "IPv4" })),
    },
  ]);
};
