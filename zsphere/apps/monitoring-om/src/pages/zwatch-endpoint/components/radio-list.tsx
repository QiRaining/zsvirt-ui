import { RadioGroup } from "@zstack/design";
import { ZWatchAlarmQueryType as IZWatchAlarmQueryType } from "@zstack/zsphere-types";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ResourceAlarmList from "zsv_shared/zwatch-alarm/resource/list";

import EventAlarmList from "../../zwatch-alarm/event/list";

import style from "./style.module.less";

interface IProps {
  currentAlarmType: IZWatchAlarmQueryType;
  setCurrentAlarmType: any;
  view: string;
  defaultQuery: any;
}

const RadioList: React.FC<IProps> = ({
  currentAlarmType,
  setCurrentAlarmType,
  view: _view,
  defaultQuery,
  ...props
}) => {
  const intl = useIntl();

  const commonDefaultQuery = useMemo(() => {
    return {
      type: defaultQuery.type,
      conditions: defaultQuery.conditions,
      extraConditions: defaultQuery.extraConditions,
    };
  }, [
    defaultQuery.conditions,
    defaultQuery.extraConditions,
    defaultQuery.type,
  ]);

  return (
    <div>
      <RadioGroup
        defaultValue={currentAlarmType}
        onValueChange={(value) => {
          setCurrentAlarmType(value);
        }}
        className={style.topRadioGroup}
        variant="button"
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
      {/* ZSV-6809 */}
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
          view="select"
          defaultQuery={commonDefaultQuery}
          {...props}
        />
      )}
      {currentAlarmType === IZWatchAlarmQueryType.Event && (
        <EventAlarmList
          view="select"
          defaultQuery={commonDefaultQuery}
          {...props}
        />
      )}
    </div>
  );
};

export default RadioList;
