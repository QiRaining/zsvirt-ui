import { CodeMirrorEditor } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import { get as _get } from "lodash-es";
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
  const {
    template = "",
    recoveryTemplate = "",
    type,
    subject,
    _recoverySubject,
  } = current;

  const getMicrosoftTeamsTemplate = (temp: string) => {
    temp = temp?.replace('"markdown": true', "");
    try {
      const _temp = _get(JSON.parse(temp), ["sections", "0"]);
      delete _temp.markdown;
      return JSON.stringify(_temp, null, 2);
    } catch (e) {
      console.error(e);
    }
  };
  const _template = getMicrosoftTeamsTemplate(template) ?? "";
  const _recoveryTemplate = getMicrosoftTeamsTemplate(recoveryTemplate) ?? "";

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
          id: "alarmMessageText",
          defaultMessage: "Alarm Message Text",
        }),
        value: <CodeMirrorEditor height={400} value={_template} readonly />,
      },
    ];

    if (type !== ZwatchSNSTextTemplateAlarmType.Event) {
      arr.push({
        label: intl.formatMessage({
          id: "recoveryMessageText",
          defaultMessage: "Recovery Message Text",
        }),
        value: (
          <CodeMirrorEditor height={400} value={_recoveryTemplate} readonly />
        ),
      });
    }

    return arr;
  }, [current, intl]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "message.title",
        defaultMessage: "Message Title",
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
