import { useSuspenseQuery } from "@apollo/client";
import { l3Network } from "@zstack/virtualization-resource/src/gql/l3-network.gql";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import Dns from "@zstack/virtualization-resource/src/pages/l3-network/detail/dns";
import IpStatistics from "@zstack/virtualization-resource/src/pages/l3-network/detail/ip-statistics";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import { Op, ShareType } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { SharingPermissions } from "zsv_administration_shared/account-information/mf-index";
import AuditList from "zsv_auditing/auditing-sub-list";
import ZWatchAlarmInDetailTab from "zsv_shared/zwatch-alarm/alarm-tab";
import { useShallow } from "zustand/react/shallow";

import { AuthCheck } from "../../../components/no-permission-page/context";
import Header from "./header";
import IpRange from "./ip-range";
import Monitoring from "./monitoring";
import Overview from "./overview";

const currentPlaceholder = {
  __typename: "L3Network",
  category: "",
  createDate: "",
  description: null,
  enableIPAM: false,
  dhcpIp: { __typename: "DhcpIp", ipv4: null, ipv6: null },
  dns: [""],
  enableSRIOV: false,
  ipVersion: 4,
  hypervisorType: "KVM",
  ipCapacity: {
    __typename: "IpCapacity",
    totalCapacity: 0,
    availableCapacity: 0,
    ipv4AvailableCapacity: null,
    ipv6AvailableCapacity: null,
    ipv4TotalCapacity: null,
    ipv6TotalCapacity: null,
    ipv4UsedIpAddressNumber: null,
  },
  ipRanges: [],
  lastOpDate: "",
  l2NetworkUuid: "",
  ipAllocateStrategy: null,
  l2Network: {
    __typename: "L2Network",
    name: "",
    uuid: "",
    type: "portGroup",
    physicalInterface: "bond1",
    virtualNetworkId: "111",
    vSwitchType: "LinuxBridge",
    enableSRIOV: false,

    attachedClusterUuids: [],
  },
  vSwitch: {
    __typename: "L2Network",
    name: "",
    uuid: "",
    type: "virtualSwitch",
    physicalInterface: "bond1",
    virtualNetworkId: "0",
    vSwitchType: "LinuxBridge",
    enableSRIOV: false,

    attachedClusterUuids: [],
  },
  networkTypeName: "",
  networkType: "",
  networkServices: [
    { __typename: "NetworkServices", networkServiceType: "SecurityGroup" },
  ],
  name: "",
  mtu: 0,
  owner: {
    __typename: "L3Owner",
    name: "admin",
    uuid: "",
    type: "account",
    linkedAccountUuid: "",
  },
  type: "L3BasicNetwork",
  uuid: "",
  shareType: "None",

  vpcVRouter: null,
};

interface IProps {
  iL3NetworkType?: string;
}

const L3NetworkDetail: React.FC<IProps> = ({ iL3NetworkType }) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const { currentUser } = usePlatformStore();

  const defaultZWachAlarmQuery = useMemo(
    () => ({
      extraConditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  const { data, refetch } = useSuspenseQuery<{
    l3Network: IL3Network;
  }>(l3Network, {
    fetchPolicy: "cache-and-network",
    variables: { uuid },
  });

  const [currentResource, cachedL3Networks, setCachedL3Networks] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedL3Networks,
        state.setCachedL3Networks,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const newData = data?.l3Network;
    if (newData && uuid) {
      const currentCachedL3Networks =
        useVirtualizationResourceStore.getState().cachedL3Networks;
      processCache(uuid, currentCachedL3Networks, setCachedL3Networks, newData);
    }
  }, [data?.l3Network, uuid, setCachedL3Networks]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    const newData = data?.l3Network;
    if (newData) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...newData };
    }
    // Get cached L3 network without updating state
    const cachedInstanceIndex = cachedL3Networks.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedL3Network =
      cachedInstanceIndex > -1
        ? cachedL3Networks[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedL3Network,
      name: cachedL3Network?.name || currentResource?.name,
    };
  }, [data?.l3Network, uuid, cachedL3Networks, currentResource?.name]);

  useActionSubscribe({
    resourceTypeList: ["Owner", "IpRange", "L3Network"],
    onFinish: () => {
      refetch();
    },
  });

  const isShared =
    currentUser?.accountUuid !== current.owner?.linkedAccountUuid &&
    currentUser?.currentIdentity !== "Admin";
  // const isShared = currentUser?.accountUuid !== current.owner?.linkedAccountUuid
  // const isShared = !!currentUser?.accountUuid && currentUser?.accountUuid !== current.owner?.uuid

  const typeNetworkMap = useMemo(() => {
    const _typeNetworkMap = {
      flow: ["ip.range"],
      manage: current.isDefault
        ? ["ip.statistics", "ip.range", "dns"]
        : ["ip.range"],
      flat: ["ip.statistics", "ip.range", "dns"],
      public: ["ip.statistics", "ip.range", "dns"],
      vpc: ["ip.statistics", "ip.range", "dns"],
    };

    // 只有共享模式为指定共享才显示共享tab页
    if (current.shareType === "Group") {
      ["vpc", "public", "flat"].forEach((network) =>
        _typeNetworkMap[network as "flat"].push("l3networ.tab.share"),
      );
    }
    return _typeNetworkMap;
  }, [current]);

  iL3NetworkType = iL3NetworkType ?? (current.networkType || "flat");

  const tabList = [
    {
      key: "ip.statistics",
      tab: intl.formatMessage({
        id: "ip.statistics",
        defaultMessage: "Port Statistics",
      }),
      value: () => (
        <IpStatistics
          current={current}
          view="virtualization.sub"
          iL3NetworkType={iL3NetworkType}
        />
      ),
    },
    {
      key: "cluster",
      tab: intl.formatMessage({ id: "cluster", defaultMessage: "Cluster" }),
      auth: {
        type: "view" as const,
        authKey: "list",
        resource: "virtualization.cluster",
      },
      value: () => (
        <ClusterList
          view="sub.vcenter.network"
          source={current}
          defaultQuery={{
            conditions: [
              {
                key: "l2Network.uuid",
                op: Op.eq,
                value: current.l2NetworkUuid,
              },
            ],
          }}
        />
      ),
    },
    {
      key: "ip.range",
      tab: intl.formatMessage({ id: "ip.range", defaultMessage: "Network Range" }),
      value: () => <IpRange current={current as any} />,
      visible: current.enableIPAM,
    },
    {
      key: "dns",
      tab: intl.formatMessage({ id: "dns", defaultMessage: "DNS" }),
      value: () => (
        <Dns
          current={current}
          iL3NetworkType={iL3NetworkType}
          isShared={isShared}
        />
      ),
    },
    // {
    //   key: 'l3networ.tab.share',
    //   tab: intl.formatMessage({ id: 'assigned.share', defaultMessage: '指定共享' }),
    //   auth: {
    //     type: 'block' as 'block',
    //     authKey: 'share.type',
    //     resource: 'common'
    //   },
    //   value: <Share current={current} />
    // }
  ];

  const tabsList: AuthTabsListItem[] = useMemo(() => {
    const dynamicTabs = tabList
      .filter((tab) =>
        typeNetworkMap[iL3NetworkType as "flat"]?.includes(tab.key),
      )
      .filter((tab) => tab.visible !== false)
      .map((tab) => ({
        label: tab.tab,
        value: tab.key,
        auth: tab.auth,
        content: tab.value,
      }));

    return [
      {
        label: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        value: "overview",
        content: () => <Overview current={current} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({
          id: "sharing.permissions",
          defaultMessage: "Sharing Permissions",
        }),
        value: "sharing.permissions",
        condition: current?.shareType === ShareType.Group,
        content: () => (
          <SharingPermissions
            source={current}
            defaultQuery={{
              extraConditions: [
                {
                  key: "resourceUuid",
                  op: Op.eq,
                  value: current?.uuid,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        value: "monitoring",
        condition: !!current?.enableIPAM,
        content: () => <Monitoring uuid={uuid} />,
      },
      ...dynamicTabs,
      {
        label: intl.formatMessage({ id: "zwatch", defaultMessage: "Alarm" }),
        value: "zwatch",
        content: () => (
          <AuthCheck
            resourceTypes={[
              "virtualization.zwatch.alarm",
              "virtualization.alarm.message",
            ]}
          >
            <ZWatchAlarmInDetailTab
              source={current}
              view="sub.vm.instance"
              defaultQuery={defaultZWachAlarmQuery}
              nameSpace="ZStack/L3Network"
            />
          </AuthCheck>
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "audit",
        auth: {
          type: "view" as const,
          authKey: "list",
          resource: "virtualization.auditing",
        },
        content: () => (
          <AuditList
            view="sub"
            defaultQuery={{
              conditions: [
                {
                  key: "resourceUuid",
                  op: Op.eq,
                  value: current.uuid,
                },
              ],
            }}
          />
        ),
      },
    ];
  }, [
    intl,
    current,
    uuid,
    tabList,
    typeNetworkMap,
    iL3NetworkType,
    refetch,
    defaultZWachAlarmQuery,
  ]);

  return (
    <div className="zsv-detail-container">
      <Header current={current} iconType={currentResource.iconType} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        contentId="main-tab"
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col"
      />
    </div>
  );
};

export default L3NetworkDetail;
