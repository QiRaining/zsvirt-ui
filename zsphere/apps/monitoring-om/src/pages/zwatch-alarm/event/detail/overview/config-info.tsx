import { useTime } from "@zstack/hooks";
import type { ListItem } from "@zstack/zsphere-components";
import { List, useMetricNameConfig, useAuth } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ZWatchAlarmVO as IZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { getHostPrefix } from "../../../../utils";
import Level from "../../../components/level";
import Modify from "../../modify";

interface IProps {
  detail: IZWatchAlarmVO;
  refetch?: () => void;
}

const BasicInfo: React.FC<IProps> = ({ detail }) => {
  const intl = useIntl();
  const { translateResourceType, translateEventType } = useMetricNameConfig();
  const [visible, setVisible] = useState(false);
  const { hasAuth } = useAuth();
  const canEditConfig = hasAuth({
    authKey: "editConfig",
    resource: "zwatch.alarm.event",
    type: "action",
  });

  const { getServerTime } = useTime();
  const formatResourceType: Function = () => {
    if (
      detail?.namespace === "ZStack/VM" &&
      detail?.userTag?.tag === "VRouter"
    ) {
      return translateResourceType("ZStack/VRouter");
    }
    return translateEventType(detail?.namespace || "");
  };

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "resourceType",
          defaultMessage: "Resource Type",
        }),
        value: `${getHostPrefix(detail.metricName)}${formatResourceType()}`,
      },
      {
        label: intl.formatMessage({
          id: "alarmLevel",
          defaultMessage: "Severity",
        }),
        value: <Level level={detail?.emergencyLevel || ("Important" as any)} />,
      },
      {
        label: intl.formatMessage({
          id: "noticeObjectCount",
          defaultMessage: "Endpoint Count",
        }),
        value: detail?.topicNum || 0,
      },
    ],
    [detail, intl, getServerTime],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "config.info",
          defaultMessage: "Configurations",
        })}
        isList
        collapsed={false}
        titleActions={
          canEditConfig
            ? [
                {
                  icon: "edit",
                  tooltip: intl.formatMessage({
                    id: "edit.config",
                    defaultMessage: "Modify Configuration",
                  }),
                  onClick() {
                    setVisible(true);
                  },
                },
              ]
            : []
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
      <Modify
        visible={visible}
        setVisible={setVisible}
        selectedList={[detail]}
        source={detail}
        position="header"
        view="main.virtualization"
      />
    </>
  );
};

export default BasicInfo;
