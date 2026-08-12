import { gql, useQuery } from "@apollo/client";
import { Text } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Header, Select } from "@zstack/zsphere-components";
import type { Zone } from "@zstack/zsphere-types/graphql";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

interface IProps {
  selectedZone: Zone | undefined;
  setSelectedZone: Function;
}

const getZoneList = gql`
  query zoneList($conditions: [Condition!], $start: Int, $limit: Int) {
    zoneList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      sortDirection: asc
    ) {
      total
      list {
        clusterCount
        primaryStorageCount
        l2NetworkCount
        vmInstanceCount
        volumeCount
        uuid
        name
        description
        state
        isDefault
        createDate
      }
    }
  }
`;

const BackupStorageHeader: React.FC<IProps> = ({
  selectedZone,
  setSelectedZone,
}) => {
  const intl = useIntl();

  const [zoneList, setZoneList] = useState<Zone[] | undefined>();

  const { data: _zoneListData } = useQuery(getZoneList, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: {
      sortBy: "createDate",
      sortDirection: "asc",
    },
    errorPolicy: "ignore",
    onCompleted(data) {
      const list = data?.zoneList?.list ?? [];
      const transformList = list?.map((zone: Zone) => ({
        name: zone?.name,
        uuid: zone?.uuid,
      }));
      setZoneList(transformList);
      setSelectedZone(transformList?.[0]);
    },
  });

  return (
    <Header.List
      className="main-list-header"
      title={intl.formatMessage({
        id: "backup.storage.title",
        defaultMessage: "Backup Storage",
      })}
      extra={
        <div className={style.zoneSelectWrapper}>
          <div className={style.label}>
            <Icon type="building" className={style.zoneIcon} />
            {intl.formatMessage({ id: "zone", defaultMessage: "Data Center" })}：
          </div>
          <Select
            className={style.zoneSelect}
            value={selectedZone?.uuid}
            onChange={(value) => {
              setSelectedZone({
                name: zoneList?.find((zone) => zone.uuid === value)?.name,
                uuid: value,
              });
            }}
            bordered={false}
            size="small"
            dropdownMatchSelectWidth={false}
            popupClassName={style.zoneSelectDropdown}
            options={zoneList?.map((zone) => ({
              label: (<Text>{zone.name}</Text>) as any,
              value: zone.uuid,
            }))}
          />
        </div>
      }
    />
  );
};

export default BackupStorageHeader;
