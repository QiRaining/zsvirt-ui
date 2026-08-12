import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AlarmHistories as IAlarmHistories } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { useWriteFragment } from "./utils";

const updateAllAlarmHistoriesAsRead = gql`
  mutation updateAllAlarmHistoriesAsRead(
    $input: UpdateAllAlarmHistoriesAsReadInput!
  ) {
    updateAllAlarmHistoriesAsRead(input: $input) {
      actionId
    }
  }
`;

export const useMarkAllRead = () => {
  const writeFragment = useWriteFragment();
  const intl = useIntl();
  const doAction = useAction();

  return async (list: IAlarmHistories[]) => {
    list.forEach(({ dataUuid: uuid }) => {
      writeFragment({
        type: "AlarmHistories",
        uuid,
        fields: "readStatus",
        inventory: {
          uuid,
          readStatus: "Read",
        },
      });
    });

    doAction({
      mutation: updateAllAlarmHistoriesAsRead,
      payload: {},
      name: intl.formatMessage({
        id: "mark.all.as.read",
        defaultMessage: "Mark All as Read",
      }),
      type: "AlarmHistories",
      total: 1,
    });
  };
};

const MarkAllAsReadAction: React.FC<IActionWrapperProps<IAlarmHistories>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const markRead = useMarkAllRead();

  const onOk = () => {
    setVisible(false);
    markRead(selectedList);
  };

  return (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "alarmMessage.modal.mark.title.confirm.all.as.read",
        defaultMessage: "Mark All as Read?",
      })}
      type="warning"
      onConfirm={onOk}
      description={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "alarm.message.confirm.modal.content",
            defaultMessage:
              "1. Acknowledged alarms will not be displayed in the Triggered Alarms tab but can be viewed in the All Alarms tab.\n2. After acknowledging, if the alarm issue is not resolved promptly, the alarm system will continue to trigger and push messages according to the rules. To avoid repeated notifications, you can set a silence period as needed.",
          })}
        </ReactMarkdown>
      }
    />
  );
};

export default MarkAllAsReadAction;
