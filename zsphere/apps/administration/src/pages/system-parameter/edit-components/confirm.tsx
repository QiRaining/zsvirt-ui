import { DialogWeak } from "@zstack/zsphere-design-biz";
import type { UpdateGlobalConfigPayload } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

export interface IProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  currItem: any;
  ok: (payloadList: UpdateGlobalConfigPayload[], configName?: string) => void;
}

const Confirm: React.FC<IProps> = ({ visible, setVisible, currItem, ok }) => {
  const intl = useIntl();

  const onOk = () => {
    setVisible(false);
    return ok(
      [
        {
          category: currItem?.formItem.category,
          name: currItem?.formItem.name,
          value: `${currItem?.formItem?.value !== "true"}`,
        },
      ],
      currItem?.name,
    );
  };

  return (
    <DialogWeak
      title={String(
        currItem?.formItem?.value !== "true"
          ? intl.formatMessage(
              {
                id: "globalConfig.modal.title.confirm.modification.enable",
                defaultMessage: "Enable {name}?",
              },
              {
                name: currItem?.name,
              },
            )
          : intl.formatMessage(
              {
                id: "globalConfig.modal.title.confirm.modification.disable",
                defaultMessage: "Disable {name}?",
              },
              {
                name: currItem?.name,
              },
            ),
      )}
      type="warning"
      onConfirm={() => onOk()}
      visible={visible}
      setVisible={setVisible}
      description={<ReactMarkdown>{currItem?.alertMessage}</ReactMarkdown>}
    />
  );
};

export default Confirm;
