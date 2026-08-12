import { useLazyQuery, gql } from "@apollo/client";
import { Drawer, DrawerBody, DrawerHeader } from "@zstack/design";
import { useBuildTriggerName } from "@zstack/zsphere-components";
import type {
  AlarmHistories,
  AlarmHistories as IAlarmHistories,
} from "@zstack/zsphere-types/graphql";
import React from "react";

import DetailContent from "./detail-content";

const getAlarmHistories = gql`
  query getAlarmHistories($uuid: String!) {
    getAlarmHistories(uuid: $uuid) {
      uuid
      accountUuid
      alarmName
      alarmZhName
      alarmStatus
      alarmUuid
      subscriptionUuid
      comparisonOperator
      context
      dataUuid
      emergencyLevel
      labels
      error
      metricName
      metricValue
      name
      namespace
      period
      readStatus
      resource {
        tagType
        tags {
          name
          color
          uuid
        }
      }
      resourceUuid
      resourceName
      canLink
      resourceType
      threshold
      createTime
      times
      type
      firstTime
      ackData {
        ackPeriod
        ackDate
        resumeAlert
        operatorAccountUuid
        owner {
          uuid
          name
        }
      }
      operatorAccountUuid
      operatorAccount {
        uuid
        name
      }
    }
  }
`;

interface AlarmHistoriesDetailProps {
  row?: IAlarmHistories;
  name?: string;
  useFor?: "main-nav" | "column"; // 主导航和列表使用
  visible?: boolean;
  setVisible?: (arg: any) => void;
  refetch?: Function;
  dataUuid?: string;
  isLayoutList?: boolean;
}

const Detail: React.FC<AlarmHistoriesDetailProps> = ({
  row,
  name: _name,
  visible,
  setVisible,
  dataUuid,
  isLayoutList,
}: AlarmHistoriesDetailProps) => {
  const buildTriggerName = useBuildTriggerName();

  const query = React.useMemo(
    () => ({
      uuid: dataUuid,
    }),
    [dataUuid],
  );

  const [getDetail, { data }] = useLazyQuery(getAlarmHistories, {
    variables: query,
    fetchPolicy: "no-cache",
  });

  React.useEffect(() => {
    if (!row && dataUuid && visible) {
      getDetail();
    }
  }, [row, getDetail, dataUuid, visible]);

  const currentMessage: AlarmHistories = React.useMemo(
    () => row ?? data?.getAlarmHistories,
    [data, row],
  );

  const name = React.useMemo(() => {
    if (_name) {
      return _name;
    }
    return currentMessage ? buildTriggerName(currentMessage) : undefined;
  }, [_name, buildTriggerName, currentMessage]);

  const handleSetOpen = React.useCallback(
    (open: boolean | ((prev: boolean) => boolean)) => {
      const nextOpen = typeof open === "function" ? open(!!visible) : open;
      setVisible?.(nextOpen);
    },
    [visible, setVisible],
  );

  return (
    <Drawer
      open={!!visible}
      setOpen={handleSetOpen}
      className="w-[600px]"
      placement="right"
    >
      <DrawerHeader>{name}</DrawerHeader>
      <DrawerBody>
        <div className="w-full">
          {currentMessage && (
            <DetailContent
              visible={visible}
              setVisible={setVisible}
              row={currentMessage}
              name={name}
              isLayoutList={isLayoutList}
            />
          )}
        </div>
      </DrawerBody>
    </Drawer>
  );
};

export default Detail;
