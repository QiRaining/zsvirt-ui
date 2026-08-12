import { gql, useLazyQuery } from "@apollo/client";
import {
  Empty,
  TabPane2 as TabPane,
  Tabs2 as Tabs,
} from "@zstack/zsphere-components";
import { useSubscribeOrgTreeChange } from "@zstack/zsphere-hooks";
import { Op } from "@zstack/zsphere-types";
import React, { useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import Audit from "zsv_auditing/auditing-sub-list";

import type { DisplayLocationType } from "../types";
import Overview from "./overview";

interface IProps {
  displayLocation: DisplayLocationType;
  snapshotType?: string;
  snapshotUuid?: string;
}
const QUERY_VOLUME_SNAPSHOT_GROUP_LIST = gql`
  query queryVolumeSnapshotGroupByUuid($uuid: String!) {
    volumeSnapshotGroup(uuid: $uuid) {
      uuid
      name
      description
      snapshotCount
      totalSize
      vmInstanceUuid
      vmInstance {
        uuid
        name
        state
        type
        rootVolumeUuid
        attachedShareableVolumeUuidList
        haveScsiLun
        zoneUuid
        architecture
        tpmList {
          uuid
          vmInstanceUuid
        }
        allVolumes {
          uuid
          lastAttachDate
          isShareable
        }
        primaryStorage {
          type
        }
        host {
          uuid
          name
          state
          status
          clusterUuid
        }
      }
      volumeSnapshotRefs {
        volumeName
        volumeUuid
        volumeType
        volumeLastAttachDate
        volumeSnapshotUuid
      }
      snapshotType
      createDate
      lastOpDate
    }
  }
`;

const QUERY_VOLUME_SNAPSHOT_LIST = gql`
  query queryVolumeSnapshotByUuid($uuid: String!) {
    volumeSnapshot(uuid: $uuid) {
      uuid
      name
      description
      snapshotCount
      totalSize
      vmInstanceUuid
      vmInstance {
        uuid
        name
        state
        type
        rootVolumeUuid
        attachedShareableVolumeUuidList
        haveScsiLun
        zoneUuid
        architecture
        tpmList {
          uuid
          vmInstanceUuid
        }
        allVolumes {
          uuid
          lastAttachDate
          isShareable
        }
        primaryStorage {
          type
        }
        host {
          uuid
          name
          state
          status
          clusterUuid
        }
      }
      volumeSnapshotRefs {
        volumeName
        volumeUuid
        volumeType
        volumeLastAttachDate
        volumeSnapshotUuid
      }
      snapshotType
      createDate
      lastOpDate
    }
  }
`;
const SnapShotDetail: React.FC<IProps> = ({
  displayLocation,
  snapshotType,
  snapshotUuid = "",
}) => {
  const intl = useIntl();
  const _gql = useMemo(
    () =>
      snapshotType === "Group"
        ? QUERY_VOLUME_SNAPSHOT_GROUP_LIST
        : QUERY_VOLUME_SNAPSHOT_LIST,
    [snapshotType],
  );

  const [_queryVolumeSnapshot, { data, loading }] = useLazyQuery(_gql);

  useEffect(() => {
    if (snapshotUuid) {
      _queryVolumeSnapshot({
        variables: {
          uuid: snapshotUuid,
        },
      });
    }
  }, [snapshotUuid]);

  useSubscribeOrgTreeChange({
    resourceTypeList: ["VolumeSnapshot", "VolumeSnapshotGroup"],
    onFinish: () => {
      if (snapshotUuid) {
        _queryVolumeSnapshot({
          variables: {
            uuid: snapshotUuid,
          },
          fetchPolicy: "network-only",
        });
      }
    },
  });

  const detail = useMemo(
    () =>
      snapshotType === "Group"
        ? data?.volumeSnapshotGroup
        : data?.volumeSnapshot,
    [data?.volumeSnapshotGroup, data?.volumeSnapshot, snapshotType],
  );

  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: snapshotUuid,
        },
      ],
    }),
    [snapshotUuid],
  );

  return (
    <>
      {snapshotUuid ? (
        <div className="main-list-header-tabs-container main-list-header-tabs-detail">
          <Tabs type="line" contentId="snapshot-tab">
            <TabPane
              style={{ position: "relative" }}
              tab={intl.formatMessage({
                id: "virtualization.overview",
                defaultMessage: "Overview",
              })}
              key="overview"
            >
              <Overview
                loading={loading}
                detail={detail!}
                displayLocation={displayLocation}
              />
            </TabPane>
            <TabPane
              tab={intl.formatMessage({ id: "audit", defaultMessage: "Event" })}
              key="auditing"
              auth={{
                type: "view",
                authKey: "list",
                resource: "auditing",
              }}
            >
              <Audit view="sub" defaultQuery={defaultQuery} />
            </TabPane>
          </Tabs>
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ height: "100%" }}
        >
          <Empty
            type="Table"
            description={intl.formatMessage({
              id: "no.data",
              defaultMessage: "No Data",
            })}
          />
        </div>
      )}
    </>
  );
};

export default SnapShotDetail;
