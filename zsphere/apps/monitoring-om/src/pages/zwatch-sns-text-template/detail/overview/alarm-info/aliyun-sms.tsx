import { Textarea } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: ISNSTextTemplate;
  refetch?: Function;
  setVisible?: Function;
}

const BasicInfo: React.FC<IProps> = ({ current, setVisible }) => {
  const intl = useIntl();

  const {
    template,
    alarmTemplateCode,
    eventTemplate,
    eventTemplateCode,
    subject,
  } = current;

  const { getServerTime } = useTime();

  const list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "messageTemplate.title",
          defaultMessage: "Alarm Message Title",
        }),
        value: <Textarea rows={2} value={subject} readOnly />,
      },
      {
        label: intl.formatMessage({
          id: "resourceAlarmMessage",
          defaultMessage: "Resource Alarm Message",
        }),
        value: <Textarea rows={3} value={template} readOnly />,
      },
      {
        label: intl.formatMessage({
          id: "templateCode",
          defaultMessage: "Template Code",
        }),
        value: alarmTemplateCode,
      },
      {
        label: intl.formatMessage({
          id: "eventAlarmMessage",
          defaultMessage: "Event Alarm Message",
        }),
        value: <Textarea rows={3} value={eventTemplate} readOnly />,
      },
      {
        label: intl.formatMessage({
          id: "templateCode",
          defaultMessage: "Template Code",
        }),
        value: eventTemplateCode,
      },
    ],
    [current, intl, getServerTime],
  );

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "templateContent",
        defaultMessage: "Template Content",
      })}
      isList
      collapsed={false}
      titleActions={[
        {
          icon: "edit",
          tooltip: intl.formatMessage({
            id: "edit.config",
            defaultMessage: "Modify Configuration",
          }),
          onClick() {
            setVisible?.(true);
          },
        },
      ]}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
