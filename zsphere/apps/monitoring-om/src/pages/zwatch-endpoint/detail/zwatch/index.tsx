import { useQuery, gql } from "@apollo/client";
import { RadioGroup } from "@zstack/design";
import {
  ZWatchAlarmQueryType as IZWatchAlarmQueryType,
  Op,
} from "@zstack/zsphere-types";
import type { EndPoint as IEndPoint } from "@zstack/zsphere-types/graphql";
import React, { useState, useMemo } from "react";
import { useIntl } from "react-intl";
import ResourceAlarmList from "zsv_shared/zwatch-alarm/resource/list";

import EventAlarmList from "../../../zwatch-alarm/event/list";
import useComponentMap from "../../../zwatch-alarm/resource/detail/useComponentMap";

const globalConfig = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      value
    }
  }
`;

interface IProps {
  current: Partial<IEndPoint>;
}

const ZWatch: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const [currentAlarmType, setCurrentAlarmType] = useState(
    IZWatchAlarmQueryType.Resource,
  );

  const { componentMap } = useComponentMap();

  const resourceSource = useMemo(
    () => ({ ...current, componentMap }),
    [current, componentMap],
  );

  // 判断第三方消息报警器是否显示
  const [_showThirdparty, setShowThirdparty] = useState("false");
  const { data: _data } = useQuery(globalConfig, {
    variables: {
      category: "zwatch",
      name: "thirdpartyAlert.enable",
    },
    onCompleted(data) {
      setShowThirdparty(data?.globalConfig?.value);
    },
  });

  const defaultQuery = useMemo(() => {
    return {
      type: currentAlarmType,
      conditions: [
        { key: "actions.actionUuid", op: Op.eq, value: current?.topic?.uuid },
      ],
    };
  }, [current?.topic?.uuid, currentAlarmType]);

  return (
    <>
      <RadioGroup
        style={{ marginBottom: "12px" }}
        defaultValue={currentAlarmType}
        onValueChange={(value) => {
          setCurrentAlarmType(value);
        }}
        variant="outline"
        options={[
          {
            value: IZWatchAlarmQueryType.Resource,
            label: intl.formatMessage({
              id: "resourceZwacthAlarm",
              defaultMessage: "Resource Alarm",
            }),
          },
          {
            value: IZWatchAlarmQueryType.Event,
            label: intl.formatMessage({
              id: "eventZwacthAlarm",
              defaultMessage: "Event Alarm",
            }),
          },
        ]}
      />
      {/* {showThirdparty === 'true' && (
          <Radio.Button value={IZWatchAlarmQueryType.Thirdparty}>
            {intl.formatMessage({
              id: 'extraZwacthAlarm',
              defaultMessage: '扩展报警器'
            })}
          </Radio.Button>
        )} */}
      {currentAlarmType === IZWatchAlarmQueryType.Resource && (
        <ResourceAlarmList
          view="sub.virtualization"
          defaultQuery={defaultQuery}
          source={resourceSource}
        />
      )}
      {currentAlarmType === IZWatchAlarmQueryType.Event && (
        <EventAlarmList
          view="sub.virtualization"
          defaultQuery={defaultQuery}
          source={current}
        />
      )}
    </>
  );
};

export default ZWatch;
