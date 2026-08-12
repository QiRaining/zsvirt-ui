import { gql } from "@apollo/client";
import { Alert } from "@zstack/design";
import { Empty, TableList } from "@zstack/zsphere-components";
import { Op } from "@zstack/zsphere-types";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

import styles from "./style.module.less";

interface IProps {
  source?: any;
  view?: string;
  snapshotCount?: number;
}

const QUERY_VOLUME_SNAP_SHOT_LIST = gql`
  query queryVolumeSnapshotList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    volumeSnapshotList(
      start: $start
      limit: $limit
      conditions: $conditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        volumeUuid
        volumeType
        size
        state
        status
        type
        groupUuid
        format
        primaryStorageInstallPath
        primaryStorageUuid
        createDate
        lastOpDate
        latest
        current
        actualSize
        primaryStorage {
          type
        }
        volume {
          uuid
          size
          name
          rootImageUuid
          diskOfferingUuid
          primaryStorage {
            uuid
            type
            name
          }
          vmInstanceUuid
          isShareable
          vmInstance {
            uuid
            name
            state
            type
            zoneUuid
          }
        }
        snapshotType
        group {
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
    }
  }
`;

const MainList: React.FC<IProps> = ({
  source = {},
  view = "main.virtualization",
  snapshotCount = 0,
}) => {
  const intl = useIntl();
  const { volumeUuid = "" } = source;
  const [conditions, setConditions] = useState<any>([
    {
      key: "volumeUuid",
      op: Op.eq,
      value: "",
    },
  ]);

  useEffect(() => {
    if (volumeUuid) {
      setConditions([
        {
          key: "volumeUuid",
          op: Op.eq,
          value: volumeUuid,
        },
      ]);
    }
  }, [volumeUuid]);

  const defaultQuery = useMemo(
    () => ({
      type: "VM",
      conditions,
    }),
    [conditions],
  );

  const actionConfig = useActionConfig();
  const queryConfig = useQueryConfig(defaultQuery);
  const columnConfig = useColumnConfig();

  const alertMessage = useMemo(() => {
    if (snapshotCount >= 5) {
      return intl.formatMessage({
        id: "virtualization.snapshot.detail.alert.warning",
        defaultMessage:
          "Too many snapshots. This will lower VM performance, increase data security risks, and occupy data storage space. For long-term data backup, you can use the backup service.",
      });
    }
    return "";
  }, [intl, snapshotCount]);

  return (
    <>
      {volumeUuid ? (
        <div className={styles.main}>
          <div className={styles?.mainText}>
            {intl.formatMessage({
              id: "virtual.machine.snapshot",
              defaultMessage: "Virtual Machine Snapshot",
            })}
          </div>
          <div className={styles.mainList}>
            {snapshotCount >= 5 && (
              <Alert variant="warning" closable style={{ marginBottom: 12 }}>
                {alertMessage}
              </Alert>
            )}
            <TableList
              rowSelection={false}
              columnConfig={columnConfig}
              actionConfig={actionConfig}
              queryConfig={queryConfig}
              gql={QUERY_VOLUME_SNAP_SHOT_LIST}
              view={view}
              type="snapshotList"
              source={source}
              defaultQuery={defaultQuery}
              toolbar={["refresh", "operation", "search"]}
              resource="snapshot"
            />
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ height: "100%" }}
        >
          <Empty
            type="Table"
            className={styles.empty}
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

export default React.memo(MainList);
