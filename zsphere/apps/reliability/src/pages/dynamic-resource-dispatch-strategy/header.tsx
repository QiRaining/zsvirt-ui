import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { Header, Select } from "@zstack/zsphere-components";
import type { Zone } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import style from "../vm-scheduling-rule/style.module.less";

interface IProps {
  selectedZoneUuid: string | undefined;
  setSelectedZoneUuid: Function;
}

const GET_ZONE_LIST = gql`
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
        clusterCount
        hostCount
        primaryStorageCount
        l2NetworkCount
        vmInstanceCount
        volumeCount
        backupStorageCount
        uuid
        name
        description
        state
        isDefault
        createDate
        lastOpDate
      }
    }
  }
`;

const DynamicResourceIspatchStrategyHeader: React.FC<IProps> = ({
  setSelectedZoneUuid,
  selectedZoneUuid,
}) => {
  const intl = useIntl();

  const [zoneList, setZoneList] = useState<Zone[] | undefined>();

  const { data: _zoneListData, loading: _zoneListLoading } = useQuery(
    GET_ZONE_LIST,
    {
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
      variables: {
        sortBy: "createDate",
        sortDirection: "asc",
      },
      errorPolicy: "ignore",
      onCompleted(data) {
        const list = data?.zoneList?.list ?? [];
        setZoneList(list);
        setSelectedZoneUuid(list?.[0]?.uuid);
      },
    },
  );

  return (
    <Header.List
      className="main-list-header"
      title={intl.formatMessage({
        id: "virtualization.dynamic.resource.ispatch.strategy",
        defaultMessage: "DRS Policy",
      })}
      extra={
        <div className={style.rightExtraContainer}>
          <Icon type="building" />
          <span className={style.label}>
            {intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}：
          </span>
          <Select
            key={selectedZoneUuid}
            defaultValue={selectedZoneUuid}
            bordered={false}
            onChange={(uuid) => setSelectedZoneUuid(uuid)}
            size="small"
            dropdownMatchSelectWidth={120}
          >
            {zoneList?.map((zone) => (
              <Select.Option value={zone?.uuid} key={zone?.uuid}>
                {intl.formatMessage(
                  {
                    id: "dashboard.zone",
                    defaultMessage: "{zone}",
                  },
                  { zone: zone?.name },
                )}
              </Select.Option>
            ))}
          </Select>
        </div>
      }
    />
  );
};

export default DynamicResourceIspatchStrategyHeader;
