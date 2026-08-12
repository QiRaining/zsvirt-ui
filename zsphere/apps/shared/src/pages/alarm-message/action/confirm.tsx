import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AlarmHistories } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const updateSingleAlarmHistoryAsRead = gql`
  mutation updateSingleAlarmHistoryAsRead(
    $input: UpdateSingleAlarmHistoryAsReadInput!
  ) {
    updateSingleAlarmHistoryAsRead(input: $input) {
      actionId
    }
  }
`;

export default function Confirm({
  visible,
  setVisible,
  selectedList,
}: IActionWrapperProps<AlarmHistories>) {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload = selectedList.map(({ dataUuid, type }) => {
      return { dataUuid, type };
    });

    doAction({
      mutation: updateSingleAlarmHistoryAsRead,
      payload,
      type: "AlarmHistories",
      name: intl.formatMessage({
        id: "alarm.message.mark.as.confirmed.action.name",
        defaultMessage: "Acknowledge Triggered Alarms",
      }),
      total: payload.length,
    });
  };

  return (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "alarm.message.confirm.modal.title",
        defaultMessage: "Acknowledge Triggered Alarms",
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
}
