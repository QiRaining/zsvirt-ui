import { DraggableCard } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { ZwatchSNSTextTemplateAlarmType } from "../../../constant";

import style from "../style.module.less";

interface IProps {
  current: ISNSTextTemplate;
  refetch?: Function;
  setVisible?: Function;
}

const BasicInfo: React.FC<IProps> = ({ current, refetch, setVisible }) => {
  const intl = useIntl();

  const { template, recoveryTemplate, type, subject, recoverySubject } =
    current;

  const list: ListItem[] = useMemo(() => {
    const arr = [
      {
        label: intl.formatMessage({
          id: "messageTemplate.title",
          defaultMessage: "Alarm Message Title",
        }),
        value: (
          <div
            className={cls(
              style.messageTemplateValue,
              style.messageTemplateValueTitle,
            )}
          >
            {subject}
          </div>
        ),
      },
      {
        label: intl.formatMessage({
          id: "alarmMessageTemplate",
          defaultMessage: "Alarm Message Text",
        }),
        value: <div className={style.messageTemplateValue}>{template}</div>,
      },
    ];

    if (ZwatchSNSTextTemplateAlarmType.Event !== type) {
      arr.push(
        {
          label: intl.formatMessage({
            id: "recoverMessageTemplate.title",
            defaultMessage: "Recovery Message Title",
          }),
          value: (
            <div
              className={cls(
                style.messageTemplateValue,
                style.messageTemplateValueTitle,
              )}
            >
              {recoverySubject}
            </div>
          ),
        },
        {
          label: intl.formatMessage({
            id: "recoveryMessageText",
            defaultMessage: "Recovery Message Text",
          }),
          value: (
            <div className={style.messageTemplateValue}>{recoveryTemplate}</div>
          ),
        },
      );
    }

    return arr;
  }, [intl, subject, template, type, recoverySubject]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "modify.templateContent",
        defaultMessage: "Modify Template Content",
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
