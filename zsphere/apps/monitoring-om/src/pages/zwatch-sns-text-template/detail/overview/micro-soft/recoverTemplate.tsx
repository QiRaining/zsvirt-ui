import { CodeMirrorEditor } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { get as _get } from "lodash-es";
import React from "react";
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

  return (
    <>
      <DraggableCard
        title={intl.formatMessage({
          id: "recoveryMessageText",
          defaultMessage: "Recovery Message Text",
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
        <CodeMirrorEditor height={400} value={_recoveryTemplate} readonly />
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
