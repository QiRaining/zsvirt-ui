import { DraggableCard } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import style from "../style.module.less";

interface IProps {
  current: ISNSTextTemplate;
  refetch?: Function;
  setVisible?: Function;
}
export const EventTemplate: React.FC<IProps> = ({
  current,
  refetch,
  setVisible,
}) => {
  const intl = useIntl();
  const { _template, eventTemplate, eventTemplateCode, _alarmTemplateCode } =
    current;
  const list = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "messageTemplate",
          defaultMessage: "Message Template",
        }),
        value: (
          <div className={style.messageTemplateValue}>{eventTemplate}</div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "templateCode",
          defaultMessage: "Template Code",
        }),
        value: (
          <div
            className={cls(
              style.messageTemplateValue,
              style.messageTemplateValueTitle,
            )}
          >
            {eventTemplateCode}
          </div>
        ),
      },
    ];
  }, [intl, current]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "eventAlert.template",
        defaultMessage: "Event Alert Template",
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
