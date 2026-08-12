import { gql } from "@apollo/client";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps, Item } from "@zstack/zsphere-types";
import React from "react";
import { useIntl } from "react-intl";

const rekeyKeyProviderRefs = gql`
  mutation rekeyKeyProviderRefs($input: RekeyKeyProviderRefsInput!) {
    rekeyKeyProviderRefs(input: $input) {
      actionId
    }
  }
`;

const Rekey: React.FC<IActionWrapperProps<Item>> = ({
  visible,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    doAction({
      mutation: rekeyKeyProviderRefs,
      payload: { rekeyAll: true },
      name: intl.formatMessage({
        id: "update.data.encryption.key",
        defaultMessage: "Rekey",
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
        id: "update.data.encryption.key.modal.title",
        defaultMessage: "Rekey?",
      })}
      description={intl.formatMessage({
        id: "update.data.encryption.key.modal.content",
        defaultMessage:
          "This operation re-encrypts all encrypted resources using the new key from the current default key provider.",
      })}
      onConfirm={onOk}
      type="warning"
    />
  );
};

export default Rekey;
