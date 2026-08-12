import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import { mergeWith } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useColumnConfig, useQueryConfig } from "../config";

const zoneList = gql`
  query zoneList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    zoneList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        state
        isDefault
        createDate
        lastOpDate
        clusterCount
        hostCount
        primaryStorageCount
        l2NetworkCount
        vmInstanceCount
        volumeCount
        backupStorageCount
      }
    }
  }
`;

const ZoneList = (props: IListProps<IZone>) => {
  const intl = useIntl();

  const defaultQuery = useMemo(() => {
    return mergeWith({}, props.defaultQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }, [props.defaultQuery]);

  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(defaultQuery);

  const subViewToolbarHandleTooltip = props?.view === "sub.remoteserver" && (
    <ReactMarkdown>
      {intl.formatMessage({
        id: "zoneList.tab.inRemoteBackupServerView.tooltip",
        defaultMessage:
          "### Zone\n1. Zones can be attached to or detached from remote backup servers.\n2. After a zone is detached from a remote backup server, backup data on your local backup server in the zone cannot be synchronized remotely. Remote backup data cannot also be restored in this zone.",
      })}
    </ReactMarkdown>
  );

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={zoneList}
      type="Zone"
      resource="zone"
      toolbarHandleTooltip={subViewToolbarHandleTooltip}
      {...props}
      defaultQuery={defaultQuery}
    />
  );
};

export default ZoneList;
