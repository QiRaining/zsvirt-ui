import { CodeMirrorEditor } from "@zstack/zsphere-components";
import { DialogBase } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import { isValidJsonString } from "@zstack/zsphere-utils";
import { message } from "antd";
import React, { useRef } from "react";
import { useIntl } from "react-intl";

import { updateSNSTextTemplate } from "../../../gql/zwatch-sns-text-template.gql";
import { Platform } from "../constant";
import { _jsonParse, _jsonStringify } from "../helper";

interface IProps extends IActionWrapperProps<ISNSTextTemplate> {
  editorType: "recoveryTemplate" | "template" | string;
  originalVal: string;
}

const Action: React.FC<IProps> = ({
  editorType,
  originalVal,
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const valueRef = useRef<string>(originalVal);

  const onOk = async () => {
    const jsonData = valueRef.current;
    if (!isValidJsonString(jsonData)) {
      message.error({
        content: intl.formatMessage({
          id: "illegalJson",
          defaultMessage: "Invalid JSON.",
        }),
      });
      return;
    }

    let value = "";

    if (selectedList?.[0]?.applicationPlatformType === Platform.HTTP) {
      value = _jsonStringify({
        sections: [
          {
            ..._jsonParse(jsonData),
          },
        ],
      });
    } else {
      // Platform.MicrosoftTeams
      value = _jsonStringify({
        "@type": "MessageCard",
        themeColor: "0076D7",
        summary:
          editorType === "template"
            ? "Alarm details"
            : "Alarm recovery details",
        sections: [
          {
            ..._jsonParse(jsonData),
            markdown: true,
          },
        ],
      });
    }

    const payload = {
      uuid: selectedList?.[0]?.uuid,
      [editorType]: value,
    };
    if (value) {
      doAction({
        mutation: updateSNSTextTemplate,
        payload,
        name: intl.formatMessage({
          id: "modify.messageTemplate",
          defaultMessage: "Modify Message Template",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
      });
      setVisible?.(false);
    }
  };

  return (
    <DialogBase
      title={intl.formatMessage({
        id: "messageTemplate.modal.title.confirm.modify",
        defaultMessage: "Modify Message Template",
      })}
      widthClassName="w-[1152px]"
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
    >
      <CodeMirrorEditor
        height="612px"
        value={originalVal}
        onChange={(val) => {
          valueRef.current = val;
        }}
      />
    </DialogBase>
  );
};

export default Action;
