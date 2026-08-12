import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { AlarmState } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import { filter, map } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";

const changeEventAlarmState = gql`
  mutation changeEventAlarmState($input: ChangeEventAlarmStateInput!) {
    changeEventAlarmState(input: $input) {
      actionId
    }
  }
`;

export default function Enable({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<ZWatchAlarmVO>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const uuids = map(
      filter(selectedList, ["state", AlarmState.Disabled]),
      "uuid",
    );

    const payload = uuids.map((uuid) => {
      return { uuid, state: AlarmState.Enabled };
    });

    doAction({
      mutation: changeEventAlarmState,
      payload,
      name: intl.formatMessage({
        id: "start.zwacthAlarm",
        defaultMessage: "Enable Alarm",
      }),
      total: payload.length,
      type: "ZWatchAlarmVO",
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "eventZwacthAlarm.modal.title.confirm.start.zwacthAlarm",
        defaultMessage: "Enable Alarm?",
      })}
      resourceNames={filter(selectedList, ["state", AlarmState.Disabled]).map(
        (item) => item.name ?? item.uuid,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
}
