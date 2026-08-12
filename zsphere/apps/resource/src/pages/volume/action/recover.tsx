import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Volume,
  RecoverDataVolumePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const recoverDataVolume = gql`
  mutation recoverDataVolume($input: RecoverDataVolumeInput!) {
    recoverDataVolume(input: $input) {
      actionId
    }
  }
`;

const RecoverDataVolume: React.FC<IActionWrapperProps<Volume>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = () => {
    const payload: RecoverDataVolumePayload[] = selectedList.map((volume) => {
      return {
        uuid: volume.uuid,
      };
    });
    doAction({
      mutation: recoverDataVolume,
      payload,
      name: intl.formatMessage({
        id: "recover",
        defaultMessage: "Recover",
      }),
      total: selectedList.length,
      type: "Volume",
    });
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "volume.modal.title.confirm.recover.volume",
        defaultMessage: "Recover Disk?",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      onConfirm={onOk}
    />
  );
};

export default RecoverDataVolume;
