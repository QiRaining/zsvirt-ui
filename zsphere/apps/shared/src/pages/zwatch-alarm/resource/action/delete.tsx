import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { ZWatchAlarmVO } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const deleteAlarms = gql`
  mutation deleteAlarms($input: DeleteZWatchAlarmInput!) {
    deleteAlarms(input: $input) {
      actionId
    }
  }
`;

export default function Delete({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<ZWatchAlarmVO>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: deleteAlarms,
      payload,
      name: intl.formatMessage({
        id: "delete.zwatchAlarm",
        defaultMessage: "Delete Alarm",
      }),
      type: "ZWatchAlarmVO",
      total: selectedList.length,
    });
  };

  return (
    <DialogP1
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "zwatchAlarm.modal.title.confirm.delete.zwatchAlarm",
        defaultMessage: "Delete Alarm?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "zwatchAlarm.modal.delete.alert.danger",
            defaultMessage:
              "After you delete an alarm, resources related to this alarm will be removed and no more alarm messages will be generated. Please exercise caution.",
          })}
        </ReactMarkdown>
      }
      onConfirm={onOk}
    />
  );
}
