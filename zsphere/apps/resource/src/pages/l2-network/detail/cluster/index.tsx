import { useLazyQuery, gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { clusterSummary } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import {
  useAuth,
  usePersistTabState,
  useSetTab,
} from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import style from "./style.module.less";

const RADIO_GROUP_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current: any;
}

const clusterList = gql`
  query clusterList(
    $start: Int
    $limit: Int
    $type: ClusterQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    clusterList(
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      conditions: $conditions
      extraConditions: $extraConditions
      replyWithCount: true
    ) {
      list {
        uuid
        name
        hypervisorType
        baremetalChassisNum
        hostNum
        createDate
      }
      total
    }
  }
`;

const RESOURCE_TYPES = {
  Cluster: "Cluster",
  BmCluster: "BmCluster",
} as const;

type ResourceType = (typeof RESOURCE_TYPES)[keyof typeof RESOURCE_TYPES];

const Cluster: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const location = useLocation();

  const hasClusterAuth = hasAuth({
    resource: "virtualization.cluster",
    authKey: "list",
    type: "view",
  });

  const hasBmCluserAuth = hasAuth({
    resource: "virtualization.bm.cluster",
    authKey: "list",
    type: "view",
  });

  const tabState = useMemo(() => {
    const orderedTypes: ResourceType[] = [];

    if (hasClusterAuth) {
      orderedTypes.push(RESOURCE_TYPES.Cluster);
    }

    if (hasBmCluserAuth) {
      orderedTypes.push(RESOURCE_TYPES.BmCluster);
    }

    return orderedTypes;
  }, [hasBmCluserAuth, hasClusterAuth]);

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

  const [getClusterSummary, { data: countData }] = useLazyQuery(
    clusterSummary,
    {
      fetchPolicy: "no-cache",
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.in,
            values: current?.attachedClusterUuids ?? [],
          },
        ],
      },
    },
  );

  const defaultQueryForNORMAL = {
    type: ClusterQueryType.Normal,
    conditions: [
      {
        key: "hypervisorType",
        op: activeKey === RESOURCE_TYPES.Cluster ? Op.notIn : Op.in,
        values: ["baremetal"],
      },
      {
        key: "uuid",
        op: Op.in,
        values: current?.attachedClusterUuids,
      },
    ],
  };

  useMount(() => {
    getClusterSummary();
  });

  useActionSubscribe({
    resourceTypeList: ["Cluster"],
    onProgress: () => {
      getClusterSummary();
    },
  });

  return (
    <AuthCheck
      resourceTypes={["virtualization.cluster", "virtualization.bm.cluster"]}
    >
      <div className={style.container}>
        <RadioGroup
          variant="outline"
          value={activeKey}
          style={RADIO_GROUP_STYLE}
          onValueChange={onChange}
          options={[
            ...(hasClusterAuth
              ? [
                  {
                    value: RESOURCE_TYPES.Cluster,
                    label: intl.formatMessage(
                      {
                        id: "cluster.count",
                        defaultMessage: "Cluster ({clusterCount})",
                      },
                      {
                        clusterCount:
                          countData?.clusterSummary?.clusterCount ?? 0,
                      },
                    ),
                  },
                ]
              : []),
            ...(hasBmCluserAuth
              ? [
                  {
                    value: RESOURCE_TYPES.BmCluster,
                    label: intl.formatMessage(
                      {
                        id: "baremetal.cluster.count",
                        defaultMessage: "Bare Metal Cluster ({clusterCount})",
                      },
                      {
                        clusterCount:
                          countData?.clusterSummary?.baremetalCount ?? 0,
                      },
                    ),
                  },
                ]
              : []),
          ]}
        />

        <>
          <ClusterList
            gql={clusterList}
            key={activeKey}
            source={{
              current,
              type:
                activeKey === RESOURCE_TYPES.Cluster
                  ? ETabType.NORMAL
                  : ETabType.BAREMETAL,
            }}
            view={`sub.virtualization.l2.network.${
              activeKey === RESOURCE_TYPES.Cluster ? "normal" : "baremetal"
            }`}
            defaultQuery={defaultQueryForNORMAL}
          />
        </>
      </div>
    </AuthCheck>
  );
};

export default React.memo(Cluster);
