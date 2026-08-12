import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  OvfExportEntity,
  DeleteExportVmInstanceFromOvfPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const DeleteAction: React.FC<IActionWrapperProps<OvfExportEntity>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const deleteExportedImage = gql`
    mutation deleteExportedOvf($input: DeleteExportVmInstanceFromOvfInput!) {
      deleteExportedOvf(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    setSelectedList?.([]);
    const payload: DeleteExportVmInstanceFromOvfPayload[] = selectedList.map(
      (item) => {
        return {
          uuid: item.uuid,
        };
      },
    );
    doAction({
      mutation: deleteExportedImage,
      payload,
      name: intl.formatMessage({
        id: "delete.exportedOvf",
        defaultMessage: "Delete Exported Virtual Machine",
      }),
      total: selectedList?.length,
      type: "VmInstance",
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "image.modal.title.confirm.delete.exportedOvf",
        defaultMessage: "Delete Exported Virtual Machine?",
      })}
      resourceType={intl.formatMessage({
        id: "exportedImage",
        defaultMessage: "Exported",
      })}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default DeleteAction;
