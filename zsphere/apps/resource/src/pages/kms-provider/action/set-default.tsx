import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

const setDefaultKmsProvider = gql`
  mutation setDefaultKmsProvider($input: SetDefaultKmsProviderInput!) {
    setDefaultKmsProvider(input: $input) {
      actionId
    }
  }
`;

const SetDefault: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0];

  const onOk = () => {
    if (!current?.uuid) {
      return;
    }
    doAction({
      mutation: setDefaultKmsProvider,
      payload: { uuid: current.uuid },
      name: intl.formatMessage({
        id: "set.default.kmsProvider",
        defaultMessage: "Set Default Key Provider",
      }),
      total: 1,
      type: "KmsProvider",
    });
  };

  return (
    <DialogWeak
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "kmsProvider.setDefault.title",
        defaultMessage: "Set as Default Key Provider?",
      })}
      onConfirm={onOk}
      onCancel={() => setVisible?.(false)}
      description={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "kmsProvider.setDefault.modal.content",
            defaultMessage:
              "After setting the selected key provider as the default:\n\n- Newly created VMs will be encrypted using this key provider.\n- Existing encrypted VMs will continue using their currently associated key provider and will not be affected.",
          })}
        </ReactMarkdown>
      }
      type="warning"
    />
  );
};

export default SetDefault;
