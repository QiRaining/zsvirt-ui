import { CodeMirrorEditor } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { Input } from "antd";
import { get as _get } from "lodash-es";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

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
    _type,
    _subject,
    recoverySubject,
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
  const [_subjectVisible, _setSubjectVisible] = useState(false);
  const [_editorInfo, _setEditorInfo] = useState({
    type: "template",
    originalVal: _template,
  });

  const _list: ListItem[] = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "messageTemplate.title",
          defaultMessage: "Alarm Message Title",
        }),
        value: (
          <Input.TextArea rows={2} value={_subject} bordered={false} readOnly />
        ),
      },
      {
        label: intl.formatMessage({
          id: "recover.messageTemplate.title",
          defaultMessage: "Recovery Message Title",
        }),
        value: (
          <Input.TextArea
            rows={2}
            value={recoverySubject}
            bordered={false}
            readOnly
          />
        ),
      },
      // {
      //   label: intl.formatMessage({
      //     id: 'alarmMessageText',
      //     defaultMessage: '报警消息文本'
      //   }),
      //   value: (
      //     <Editor
      //       height={400}
      //       language="json"
      //       value={_template}
      //       loading={<Spin />}
      //       options={{
      //         fontSize: 14,
      //         scrollbar: { vertical: 'hidden', verticalScrollbarSize: 8 }
      //       }}
      //     />
      //   )
      // },
      // {
      //   label: intl.formatMessage({
      //     id: 'recoveryMessageText',
      //     defaultMessage: '恢复消息文本'
      //   }),
      //   value: (
      //     <Editor
      //       height={400}
      //       language="json"
      //       value={_recoveryTemplate}
      //       loading={<Spin />}
      //       options={{
      //         fontSize: 14,
      //         scrollbar: { vertical: 'hidden', verticalScrollbarSize: 8 }
      //       }}
      //     />
      //   )
      // }
    ],
    [current, intl],
  );

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "alarmMessageText",
          defaultMessage: "Alarm Message Text",
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
        <CodeMirrorEditor height={400} value={_template} readonly />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
