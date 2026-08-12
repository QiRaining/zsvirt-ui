import { gql } from "@apollo/client";
import { DialogP2 } from "@zstack/zsphere-design-biz";
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
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload = {
      resourceUuids: selectedList.map((item) => item.uuid),
      resourceType: "VmInstanceVO",
    };
    doAction({
      mutation: rekeyKeyProviderRefs,
      payload,
      name: intl.formatMessage({
        id: "update.data.encryption.key",
        defaultMessage: "Rekey",
      }),
      total: 1,
    });
  };

  return (
    <DialogP2
      title={intl.formatMessage({
        id: "update.data.encryption.key.modal.title",
        defaultMessage: "Rekey?",
      })}
      bannerType="danger"
      bannerMessage={intl.formatMessage({
        id: "update.data.encryption.key.modal.alert",
        defaultMessage:
          "This operation re-encrypts the selected virtual machines using the new key from the current default key provider.",
      })}
      resourceNames={selectedList.map((item) => item.name)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default Rekey;
