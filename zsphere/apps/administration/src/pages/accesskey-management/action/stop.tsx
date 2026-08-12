import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AccessKey as IAccessKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const changeAccessKeyState = gql`
  mutation ($input: ChangeAccessKeyStateInput!) {
    changeAccessKeyState(input: $input) {
      actionId
    }
  }
`;
const DeleteModal: React.FC<IActionWrapperProps<IAccessKey>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = async () => {
    doAction({
      mutation: changeAccessKeyState,
      payload: selectedList.map((cv) => ({
        uuid: cv.uuid,
        stateEvent: "disable",
      })),
      name: intl.formatMessage({
        id: "accesskey.action.change.state.disable",
        defaultMessage: "Disable AccessKey",
      }),
      type: "AccessKey",
      total: selectedList.length,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  const resourceNames = selectedList?.map((cv) => cv?.AccessKeyID ?? cv.uuid);

  return (
    <DialogP3
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      resourceNames={resourceNames}
      bannerMessage={intl.formatMessage({
        id: "accesskey.modal.alert.warning.stop.local",
        defaultMessage: "Disabling an AccessKey will revoke all API access permissions authorized by this AccessKey.",
      })}
      resourceType={intl.formatMessage({
        id: "accesskey",
        defaultMessage: "AccessKey",
      })}
      title={intl.formatMessage({
        id: "accesskeyManagementLocal.modal.title.confirm.stop.accesskey",
        defaultMessage: "Disable AccessKey?",
      })}
    />
  );
};

export default DeleteModal;
