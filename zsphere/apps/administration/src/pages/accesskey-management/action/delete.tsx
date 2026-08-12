import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { AccessKey as IAccessKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteAccessKey = gql`
  mutation ($input: DeleteAccessKeyInput!) {
    deleteAccessKey(input: $input) {
      actionId
    }
  }
`;
const DeleteModal: React.FC<IActionWrapperProps<IAccessKey>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = async () => {
    setVisible(false);
    const payload = selectedList.map((cv) => ({
      uuid: cv.uuid,
    }));
    doAction({
      mutation: deleteAccessKey,
      payload,
      name: intl.formatMessage({
        id: "accesskey.action.delete",
        defaultMessage: "Delete AccessKey",
      }),
      total: selectedList.length,
      type: "AccessKey",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const resourceNames = selectedList?.map((cv) => cv?.AccessKeyID ?? cv.uuid);

  return (
    <DialogP1
      onConfirm={onOk}
      visible={visible}
      setVisible={setVisible}
      resourceNames={resourceNames}
      bannerMessage={intl.formatMessage({
        id: "accesskey.modal.alert.warning.deletes.local",
        defaultMessage: "Deleting an AccessKey will revoke all API access permissions authorized by this AccessKey.",
      })}
      resourceType={intl.formatMessage({
        id: "accesskey",
        defaultMessage: "AccessKey",
      })}
      title={intl.formatMessage({
        id: "accesskeyManagementLocal.modal.title.confirm.delete.accesskey",
        defaultMessage: "Delete AccessKey?",
      })}
    />
  );
};

export default DeleteModal;
