import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  Image as IImage,
  DeleteExportedImagePayload as IDeleteExportedImagePayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";

const DeleteAction: React.FC<IActionWrapperProps<IImage>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const doAction = useAction();

  const deleteExportedImage = gql`
    mutation deleteExportedImage($input: DeleteExportedImageInput!) {
      deleteExportedImage(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    setSelectedList?.([]);
    const payload: IDeleteExportedImagePayload[] = selectedList.map((item) => {
      return {
        imageUuid: item.uuid,
        backupStorageUuid:
          item?.backupStorageRefs?.[0]?.backupStorageUuid || "",
      };
    });
    doAction({
      mutation: deleteExportedImage,
      payload,
      name: intl.formatMessage({
        id: "delete.exportedImage",
        defaultMessage: "Delete Exported Image",
      }),
      total: selectedList?.length,
      type: "Image",

      onFinish: (result: IActionResult) => {
        console.log("onFinish:", result);
        if (location.pathname?.includes("image/detail")) {
          navigate(-1);
        }
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "image.modal.title.confirm.delete.exportedImage",
        defaultMessage: "Delete Exported Image?",
      })}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
