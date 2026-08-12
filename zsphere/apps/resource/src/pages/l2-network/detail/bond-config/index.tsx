import { useLazyQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import { countHostList } from "@zstack/virtualization-resource/src/gql/host.gql";
import { countUplinkGroupList } from "@zstack/virtualization-resource/src/gql/uplink-group.gql";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { HostQueryType, Op } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import { useMount } from "ahooks";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import BaseInfo from "./base-info";
import PhysicalNic from "./physical-nic";

import style from "./style.module.less";

const ALERT_MARGIN_STYLE = { marginBottom: "12px" } as const;

interface IProps {
  current: IL2Network;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const addedBondDefaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "l2NetworkUuid",
          op: Op.eq,
          value: current?.uuid,
        },
      ],
    };
  }, [current]);

  const notAddedBondDefaultQuery = useMemo(() => {
    return {
      type: HostQueryType.GetHostNotInVSwitch,
      extraConditions: [
        {
          key: "vswitchUuid",
          value: current?.uuid,
          op: Op.eq,
        },
        {
          key: "bondingName",
          value: current?.physicalInterface,
          op: Op.eq,
        },
      ],
      conditions: [
        {
          key: "clusterUuid",
          op: Op.in,
          values: current?.attachedClusterUuids ?? [],
        },
      ],
    };
  }, [current]);

  const [getAddUplinkGroupCount, { data: addedUplinkGroupCount }] =
    useLazyQuery(countUplinkGroupList, {
      variables: addedBondDefaultQuery,
    });

  const [getNotAddedBondCount, { data: notAddedBondData }] = useLazyQuery(
    countHostList,
    {
      variables: notAddedBondDefaultQuery,
    },
  );

  useMount(() => {
    getAddUplinkGroupCount();
    getNotAddedBondCount();
  });

  useActionSubscribe({
    resourceTypeList: ["L2Network", "Host", "Bond"],
    onFinish: (_e: any) => {
      getAddUplinkGroupCount();
      getNotAddedBondCount();
    },
  });

  return (
    <div className={style.container}>
      {notAddedBondData?.countHostList?.total > 0 && (
        <Alert variant="warning" closable style={ALERT_MARGIN_STYLE}>
          {intl.formatMessage(
            {
              id: "vswitch.with.notAdded.host.alert.in.detail",
              defaultMessage:
                "In the cluster attached to the current distributed switch, {number} hosts have not joined the uplink. These hosts will not connect to this distributed switch network.",
            },
            { number: notAddedBondData?.countHostList?.total },
          )}
        </Alert>
      )}
      <BaseInfo current={current} refetch={refetch} />
      <PhysicalNic
        current={current}
        addedUplinkGroupCount={
          addedUplinkGroupCount?.uplinkGroupList?.total || 0
        }
        notAddedBondCount={notAddedBondData?.countHostList?.total || 0}
      />
    </div>
  );
};

export default Overview;
