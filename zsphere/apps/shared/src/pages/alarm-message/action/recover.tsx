import { gql } from "@apollo/client";
import { useBuildName } from "@zstack/zsphere-components";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AlarmHistories as IAlarmHistories } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const updateAlertDataAck = gql`
  mutation updateAlertDataAck($input: UpdateAlertDataAckInput!) {
    updateAlertDataAck(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IAlarmHistories>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
  position,
}) => {
  const intl = useIntl();
  const buildName = useBuildName();
  const doAction = useAction();

  const onOk = async () => {
    setVisible(false);

    doAction({
      mutation: updateAlertDataAck,
      payload: selectedList.map(({ uuid: dataUuid }) => ({ dataUuid })),
      name: intl.formatMessage({
        id: "recover.alert",
        defaultMessage: "Restore Alarm",
      }),
      total: selectedList.length,
      onFinish: () => {
        setSelectedList?.([]);
        if (position === "header") {
          refetch?.();
        }
      },
    });
  };

  return (
    <DialogP3
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "alarmMessage.modal.title.confirm.recover.alarmAlert",
        defaultMessage: "Restore Alarm?",
      })}
      resourceNames={selectedList.map((item: any) => buildName(item))}
      bannerMessage={intl.formatMessage({
        id: "alarmMessage.modal.recover.alarmAlert.info",
        defaultMessage: `After an alarm is restored, the alarm will continue to push alarm messages.`,
      })}
    />
  );
};

export default Action;
