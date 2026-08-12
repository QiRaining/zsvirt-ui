import { useLazyQuery } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import { AuthCheck } from "@zstack/virtualization-resource/src/components/no-permission-page/context";
import { clusterCount } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { hostCount } from "@zstack/virtualization-resource/src/gql/host.gql";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import HostList from "@zstack/virtualization-resource/src/pages/host/list";
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
import { useLocation } from "react-router";

import style from "./style.module.less";

const MARGIN_BOTTOM_12_STYLE = { marginBottom: 12 } as const;

interface IProps {
  current: IZone;
}

const ClusterHost: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const location = useLocation();

  const countRef = useRef<{ clusterCount: number; hostCount: number }>({
    clusterCount: 0,
    hostCount: 0,
  });

  const hasClusterAuth = hasAuth({
    resource: "virtualization.cluster",
    authKey: "list",
    type: "view",
  });

  const { activeKey, onChange } = usePersistTabState(
    "cluster-host",
    hasClusterAuth ? ["cluster", "host"] : ["host"],
  );

  const { setTab } = useSetTab();

  useEffect(() => {
    const { state } = location;
    const tabType = (state as any)?.tabType;
    if (tabType) {
      setTab("cluster-host", tabType);
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

  const [getClusterCount, { data: clusterData, loading: clusterDataLoading }] =
    useLazyQuery(clusterCount, {
      variables: defaultQuery,
    });

  const [getHostList, { data: hostData, loading: hostDataLoading }] =
    useLazyQuery(hostCount, {
      variables: defaultQuery,
    });

  const countRefCurrent = React.useMemo(() => {
    if (clusterDataLoading || hostDataLoading) {
      return countRef.current;
    }
    countRef.current = {
      clusterCount:
        clusterData?.clusterList?.total ?? countRef.current.clusterCount,
      hostCount: hostData?.hostList?.total ?? countRef.current.hostCount,
    };
    return countRef.current;
  }, [clusterDataLoading, clusterData, hostDataLoading, hostData]);

  const getCount = () => {
    getClusterCount();
    getHostList();
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
    resourceTypeList: ["HostVO"],
    onProgress: () => {
      getHostList();
    },
  });

  return (
    <AuthCheck
      resourceTypes={["virtualization.cluster", "virtualization.host"]}
    >
      <div className={style.container}>
        <RadioGroup
          variant="outline"
          value={activeKey}
          style={MARGIN_BOTTOM_12_STYLE}
          onValueChange={onChange}
          options={[
            ...(hasClusterAuth
              ? [
                  {
                    value: "cluster",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.cluster-host.cluster.tab.n",
                        defaultMessage: "Cluster ({n})",
                      },
                      {
                        n: countRefCurrent.clusterCount,
                      },
                    ),
                  },
                ]
              : []),
            ...(hasAuth({
              resource: "virtualization.host",
              type: "view",
              authKey: "list",
            })
              ? [
                  {
                    value: "host",
                    label: intl.formatMessage(
                      {
                        id: "virtualization.zone.detail.cluster-host.host.tab.n",
                        defaultMessage: "Host ({n})",
                      },
                      {
                        n: countRefCurrent.hostCount,
                      },
                    ),
                  },
                ]
              : []),
          ]}
        />

        {activeKey === "cluster" && (
          <ClusterList
            view="sub.virtualization.zone"
            source={current}
            defaultQuery={defaultQuery}
          />
        )}
        {activeKey === "host" && (
          <HostList
            view="sub.virtualization.zone"
            customView="virtualization.custom"
            withResourceAttribute
            source={current}
            defaultQuery={defaultQuery}
          />
        )}
      </div>
    </AuthCheck>
  );
};

export default React.memo(ClusterHost);
