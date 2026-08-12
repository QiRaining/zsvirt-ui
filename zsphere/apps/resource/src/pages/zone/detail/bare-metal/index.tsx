import { gql, useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { baremetalChassisList } from "@zstack/virtualization-resource/src/gql/baremetal-chassis.gql";
import { baremetalInstanceList } from "@zstack/virtualization-resource/src/gql/baremetal-instance.gql";
import {
  useAuth,
  usePersistTabState,
  useSetTab,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useMemo, useRef, useEffect } from "react";
import { useIntl } from "react-intl";

const BareMetalChassisList = React.lazy(() =>
  import("zsv_baremetal/baremetal-chassis/list").catch(() => ({
    default: () => null,
  })),
);
const BareMetalClusterList = React.lazy(() =>
  import("zsv_baremetal/baremetal-cluster/list").catch(() => ({
    default: () => null,
  })),
);
const BareMetalInstanceList = React.lazy(() =>
  import("zsv_baremetal/baremetal-instance/list").catch(() => ({
    default: () => null,
  })),
);
import { useLocation } from "react-router";

import style from "./style.module.less";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current: IZone;
}

const RESOURCE_TYPES = {
  BARE_METAL_CLUSTER: "baremetalCluster",
  BARE_METAL_CHASSIS: "baremetalChassis",
  BARE_METAL_INSTANCE: "baremetalInstance",
} as const;

type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

const QUERY_BAREMETAL_CLUSTER_LIST = gql`
  query queryClusterList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    clusterList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
    }
  }
`;

const BareMetal: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const location = useLocation();

  const countRef = useRef<{
    clusterCount: number;
    deviceCount: number;
    hostCount: number;
  }>({
    clusterCount: 0,
    deviceCount: 0,
    hostCount: 0,
  });

  const hasBmClusterAuth = hasAuth({
    resource: "virtualization.bm.cluster",
    authKey: "list",
    type: "view",
  });

  const hasBmChassisAuth = hasAuth({
    resource: "virtualization.bm.chassis",
    authKey: "list",
    type: "view",
  });

  const hasBmInstanceAuth = hasAuth({
    resource: "virtualization.bm.instance",
    authKey: "list",
    type: "view",
  });

  const tabState = useMemo(() => {
    const orderedTypes: ResourceType[] = [];

    if (hasBmClusterAuth) {
      orderedTypes.push(RESOURCE_TYPES.BARE_METAL_CLUSTER);
    }

    if (hasBmChassisAuth) {
      orderedTypes.push(RESOURCE_TYPES.BARE_METAL_CHASSIS);
    }

    if (hasBmInstanceAuth) {
      orderedTypes.push(RESOURCE_TYPES.BARE_METAL_INSTANCE);
    }

    return orderedTypes;
  }, [hasBmClusterAuth, hasBmChassisAuth, hasBmInstanceAuth]);

  const { activeKey, onChange } = usePersistTabState(
    "baremetal-tabs",
    tabState,
  );

  const { setTab } = useSetTab();

  useEffect(() => {
    const { state } = location;
    const tabType = (state as any)?.tabType;
    if (tabType) {
      setTab("baremetal-tabs", tabType);
    }
  }, [location, location.state]);

  const defaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "zone.uuid",
          value: current.uuid,
          op: Op.eq,
        },
      ],
    };
  }, [current.uuid]);

  const baremetalClusterDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "zone.uuid",
          value: current.uuid,
          op: Op.eq,
        },
        {
          key: "hypervisorType",
          op: Op.eq,
          value: "baremetal",
        },
      ],
    };
  }, [current.uuid]);

  const baremetalHostDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "zoneUuid",
          value: current.uuid,
          op: Op.eq,
        },
        {
          key: "state",
          op: Op.ne,
          value: "Destroyed",
        },
      ],
    };
  }, [current.uuid]);

  // 统计裸金属集群、设备、主机数量
  const [getClusterCount, { data: clusterData, loading: clusterDataLoading }] =
    useLazyQuery(QUERY_BAREMETAL_CLUSTER_LIST, {
      variables: {
        ...defaultQuery,
        conditions: [
          ...defaultQuery.conditions,
          {
            key: "hypervisorType",
            op: Op.eq,
            value: "baremetal",
          },
        ],
      },
    });
  const [getChassisCount, { data: chassisData, loading: chassisDataLoading }] =
    useLazyQuery(baremetalChassisList, { variables: defaultQuery });
  const [
    getInstanceCount,
    { data: instanceData, loading: instanceDataLoading },
  ] = useLazyQuery(baremetalInstanceList, {
    variables: baremetalHostDefaultQuery,
  });

  const countRefCurrent = React.useMemo(() => {
    if (clusterDataLoading || chassisDataLoading || instanceDataLoading) {
      return countRef.current;
    }
    countRef.current = {
      clusterCount:
        clusterData?.clusterList?.total ?? countRef.current.clusterCount,
      deviceCount:
        chassisData?.baremetalChassisList?.total ??
        countRef.current.deviceCount,
      hostCount:
        instanceData?.baremetalInstanceList?.total ??
        countRef.current.hostCount,
    };
    return countRef.current;
  }, [
    clusterDataLoading,
    clusterData,
    chassisDataLoading,
    chassisData,
    instanceDataLoading,
    instanceData,
  ]);

  const getCount = () => {
    getClusterCount();
    getChassisCount();
    getInstanceCount();
  };

  useMount(() => {
    getCount();
  });

  useActionSubscribe({
    resourceTypeList: ["Cluster"],
    onProgress: () => {
      getClusterCount();
    },
  });

  useActionSubscribe({
    resourceTypeList: ["BaremetalChassis"],
    onProgress: () => {
      getChassisCount();
    },
  });

  useActionSubscribe({
    resourceTypeList: ["BaremetalInstance"],
    onProgress: () => {
      getInstanceCount();
    },
  });

  return (
    <AuthCheck
      resourceTypes={[
        "virtualization.bm.cluster",
        "virtualization.bm.chassis",
        "virtualization.bm.instance",
      ]}
    >
      <div className={style.container}>
        <RadioGroup
          variant="outline"
          value={activeKey}
          style={MARGIN_BOTTOM_12_STYLE}
          onValueChange={onChange}
          options={[
            ...(hasBmClusterAuth
              ? [
                  {
                    value: "baremetalCluster",
                    label: intl.formatMessage(
                      {
                        id: "baremetal.zone.detail.cluster.tab.n",
                        defaultMessage: "Bare Metal Cluster ({n})",
                      },
                      { n: countRefCurrent.clusterCount },
                    ),
                  },
                ]
              : []),
            ...(hasBmChassisAuth
              ? [
                  {
                    value: "baremetalChassis",
                    label: intl.formatMessage(
                      {
                        id: "baremetal.zone.detail.device.tab.n",
                        defaultMessage: "Bare Metal Chassis ({n})",
                      },
                      { n: countRefCurrent.deviceCount },
                    ),
                  },
                ]
              : []),
            ...(hasBmInstanceAuth
              ? [
                  {
                    value: "baremetalInstance",
                    label: intl.formatMessage(
                      {
                        id: "baremetal.zone.detail.host.tab.n",
                        defaultMessage: "Bare Metal Instance ({n})",
                      },
                      { n: countRefCurrent.hostCount },
                    ),
                  },
                ]
              : []),
          ]}
        />

        {activeKey === "baremetalCluster" && (
          <React.Suspense fallback={null}>
            <BareMetalClusterList
              source={current}
              defaultQuery={baremetalClusterDefaultQuery}
              view="main"
            />
          </React.Suspense>
        )}
        {activeKey === "baremetalChassis" && (
          <React.Suspense fallback={null}>
            <BareMetalChassisList
              source={current}
              defaultQuery={defaultQuery}
              view="main"
            />
          </React.Suspense>
        )}
        {activeKey === "baremetalInstance" && (
          <React.Suspense fallback={null}>
            <BareMetalInstanceList
              source={current}
              defaultQuery={baremetalHostDefaultQuery}
              view="main"
              customView="custom"
              withResourceAttribute
            />
          </React.Suspense>
        )}
      </div>
    </AuthCheck>
  );
};

export default React.memo(BareMetal);
