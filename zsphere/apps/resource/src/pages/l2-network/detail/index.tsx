import { useSuspenseQuery } from "@apollo/client";
import { queryL2Network } from "@zstack/virtualization-resource/src/gql/l2-network.gql";
import L3NetworkList from "@zstack/virtualization-resource/src/pages/l3-network/list";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import { Op, ShareType } from "@zstack/zsphere-types";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import { SharingPermissions } from "zsv_administration_shared/account-information/mf-index";
import AuditList from "zsv_auditing/auditing-sub-list";
import { useShallow } from "zustand/react/shallow";

import BondConfig from "./bond-config";
import Cluster from "./cluster";
import Header from "./header";
import NetworkTopo from "./network-topology";
import Overview from "./overview";

const currentPlaceholder = {
  __typename: "L2Network",
  uuid: "",
  name: "",
  l3networkNum: 0,
  physicalInterface: "bond1",
  description: "",
  type: "virtualSwitch",
  createDate: "",
  lastOpDate: "",
  vni: null,
  vlan: null,
  attachedClusterUuids: [],
  enableSRIOV: false,
  shareType: "None",
  vSwitchType: "LinuxBridge",
  clusters: [{ __typename: "Cluster", name: "", uuid: "" }],
  owner: {
    __typename: "AccountInfo",
    name: "",
    uuid: "",
    type: "account",
  },
  zone: { __typename: "Zone", name: "", uuid: "" },
  vxlanPool: null,
};

const L2NetworkDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const intl = useIntl();

  const { data, refetch, error, loading } = useSuspenseQuery(queryL2Network, {
    fetchPolicy: "cache-and-network",
    variables: {
      conditions: [
        {
          key: "uuid",
          value: uuid,
        },
      ],
    },
  });

  const [currentResource, cachedL2Networks, setCachedL2Networks] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedL2Networks,
        state.setCachedL2Networks,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const newData = data?.l2NetworkList?.list?.[0];
    if (newData && uuid) {
      const currentCachedL2Networks =
        useVirtualizationResourceStore.getState().cachedL2Networks;
      processCache(uuid, currentCachedL2Networks, setCachedL2Networks, newData);
    }
  }, [data?.l2NetworkList?.list, uuid, setCachedL2Networks]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    const newData = data?.l2NetworkList?.list?.[0];
    if (!newData && !loading && !error) {
      const unauthorizedError = new Error();
      unauthorizedError.name = "UnauthorizedResourceError";
      throw unauthorizedError;
    }
    if (newData) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...newData };
    }
    // Get cached L2 network without updating state
    const cachedInstanceIndex = cachedL2Networks.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedL2Network =
      cachedInstanceIndex > -1
        ? cachedL2Networks[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedL2Network,
      name: cachedL2Network?.name || currentResource?.name,
    };
  }, [data, loading, error, uuid, cachedL2Networks, currentResource?.name]);

  useActionSubscribe({
    resourceTypeList: ["Owner", "IpRange", "L2Network"],
    onFinish: () => {
      refetch();
    },
  });

  const defaultQuery = useMemo(
    () => ({ conditions: [{ key: "resourceUuid", op: Op.eq, value: uuid }] }),
    [uuid],
  );

  const tabsList = useMemo<AuthTabsListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        value: "overview",
        content: () => <Overview current={current!} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({
          id: "network.topology",
          defaultMessage: "Network Topology",
        }),
        value: "topology",
        content: () => <NetworkTopo current={current!} />,
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
        label: intl.formatMessage({
          id: "virtualization.l3network",
          defaultMessage: "Distributed Port Group",
        }),
        value: "l3network",
        auth: {
          resource: "virtualization.l3.network",
          type: "view",
          authKey: "list",
        },
        content: () => (
          <L3NetworkList
            source={current}
            view="sub.virtualization.l2-network"
            customView="custom"
            withResourceAttribute
            defaultQuery={{
              conditions: [
                {
                  key: "portGroup.vSwitchUuid",
                  op: Op.eq,
                  value: current?.uuid,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster",
          defaultMessage: "Cluster",
        }),
        value: "cluster",
        auth: {
          resource: "virtualization.cluster",
          type: "view",
          authKey: "list",
        },
        content: () => <Cluster key={current?.uuid} current={current} />,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.bonding",
          defaultMessage: "Uplink",
        }),
        value: "bondConfig",
        content: () => <BondConfig current={current} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({
          id: "auditing",
          defaultMessage: "Event",
        }),
        value: "audit",
        content: () => <AuditList view="sub" defaultQuery={defaultQuery} />,
      },
    ],
    [current, defaultQuery, intl, refetch],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={current} />
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

export default L2NetworkDetail;
