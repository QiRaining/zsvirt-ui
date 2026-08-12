import { useQuery, gql } from "@apollo/client";
import { fiberChannelLunList } from "@zstack/virtualization-resource/src/gql/fiber-channel-lun.gql";
import { iscsiLunList } from "@zstack/virtualization-resource/src/gql/iscsi-lun.gql";
import { TabPane2 as TabPane, Tabs2 as Tabs } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import AuditList from "zsv_auditing/auditing-sub-list";

import DetailAction from "./detail-action";
import HostList from "./host";
import Overview from "./overview";
import VMList from "./vm";

const SPACE_STYLE = { width: "100%", display: "flex" } as const;

const iscsiLunListForHost = gql`
  query iscsiLunList($conditions: [Condition!], $hostUuid: String!) {
    iscsiLunList(conditions: $conditions) {
      list {
        uuid
        name
        wwid
        wwn
        vendor
        model
        serial
        type
        path
        state
        source
        size
        iscsiTargetUuid
        hctl
        createDate
        lastOpDate
        scsiLunHostRefs {
          hostUuid
        }
        scsiLunVmInstanceRefs {
          vmInstanceUuid
        }
        healthState(hostUuid: $hostUuid)
      }
    }
  }
`;

const fiberChannelLunListForHost = gql`
  query fiberChannelLunList($conditions: [Condition!], $hostUuid: String!) {
    fiberChannelLunList(conditions: $conditions) {
      list {
        uuid
        name
        wwid
        wwn
        vendor
        model
        serial
        type
        path
        state
        source
        size
        fiberChannelStorageUuid
        createDate
        lastOpDate
        scsiLunHostRefs {
          hostUuid
        }
        scsiLunVmInstanceRefs {
          vmInstanceUuid
        }
        healthState(hostUuid: $hostUuid)
      }
    }
  }
`;

interface IProps {
  uuid: string;
  extraTabPane?: React.ReactElement;
  hostUuid?: string;
}

const IscsiServerDetail: React.FC<IProps> = ({
  uuid,
  extraTabPane,
  hostUuid,
}) => {
  const intl = useIntl();

  const {
    loading: iscsiLunLoading,
    data: iscsiLunData,
    refetch: iscsiLunRefetch,
  } = useQuery(hostUuid ? iscsiLunListForHost : iscsiLunList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
      ...(hostUuid
        ? {
            hostUuid,
          }
        : null),
    },
  });

  const {
    loading: fiberChannelLunLoading,
    data: fiberChannelLunData,
    refetch: fiberChannelLunRefetch,
  } = useQuery(hostUuid ? fiberChannelLunListForHost : fiberChannelLunList, {
    variables: {
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: uuid,
        },
      ],
      ...(hostUuid
        ? {
            hostUuid,
          }
        : null),
    },
  });

  const current = useMemo<IIscsiLun>(() => {
    return (
      iscsiLunData?.iscsiLunList?.list?.[0] ||
      fiberChannelLunData?.fiberChannelLunList?.list?.[0] || { uuid }
    );
  }, [iscsiLunData, fiberChannelLunData, uuid]);

  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  const refetch = () => {
    iscsiLunRefetch?.();
    fiberChannelLunRefetch?.();
  };

  return (
    <AutoSkeleton
      name="iscsi-lun-detail"
      loading={iscsiLunLoading || fiberChannelLunLoading}
    >
      {current ? (
        <div className="zsv-detail-container">
          <Tabs type="line" contentId="iscsi-server-lun-detail">
            <TabPane
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <div className="flex flex-col gap-2" style={SPACE_STYLE}>
                <DetailAction current={current} refetch={refetch} />
                <Overview current={current} hostUuid={hostUuid} />
              </div>
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "vm", defaultMessage: "Virtual Machine" })}
              key="vm"
            >
              <VMList current={current} />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "host", defaultMessage: "Host" })}
              key="host"
            >
              <HostList current={current} />
            </TabPane>

            {extraTabPane}

            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="auditing"
              auth={{
                type: "view",
                authKey: "list",
                resource: "auditing",
              }}
            >
              <AuditList view="sub" defaultQuery={defaultQuery} />
            </TabPane>
          </Tabs>
        </div>
      ) : null}
    </AutoSkeleton>
  );
};

export default IscsiServerDetail;
