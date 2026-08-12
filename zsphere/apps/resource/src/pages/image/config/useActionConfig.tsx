import { gql, useQuery } from "@apollo/client";
import { imageList } from "@zstack/virtualization-resource/src/gql/image.gql";
import DeleteExportedImageModal from "@zstack/virtualization-resource/src/pages/image/action/delete-exported-image-modal";
import DeleteModal from "@zstack/virtualization-resource/src/pages/image/action/delete-modal";
import ExpungeModal from "@zstack/virtualization-resource/src/pages/image/action/expunge-modal";
// shared end
import CreateVm from "@zstack/virtualization-resource/src/pages/vm/create";
import { verifyCancelShare } from "@zstack/zsphere-components";
import { useActionConfig as _useActionConfig } from "@zstack/zsphere-engine/src/image";
import type { IOption } from "@zstack/zsphere-engine/src/image/useActionConfig";
import { useAction } from "@zstack/zsphere-hooks";
import { useHandleHttpsDownload } from "@zstack/zsphere-hooks";
import type {
  Image as IImage,
  RecoverImagePayload as IRecoverImagePayload,
} from "@zstack/zsphere-types/graphql";
import { message } from "antd";
import { map } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import CancelShare from "zsv_administration_shared/account-information/action/cancel-share";
import SetShareType from "zsv_administration_shared/account-information/action/set-share-type";
import { downloadImageFile } from "zsv_resource_shared/image/utils";

import EditNameDesc from "../action/edit-name-desc";
import ExportModal from "../action/export-modal";
import ModifyConfig from "../action/modify-config";
// shared start
import ShareResource from "../action/share-resource";
import StorageMigrateDrawer from "../action/storage-migrate-drawer";
import SyncImage from "../action/sync-image";
import {
  verifyCreateVm,
  verifyDelete,
  verifyExport,
  verifySingleSelect,
  verifyStorageMigrate,
  verifySyncImage,
  verifyZmigrateImage,
} from "../action/validator";
import CreateModal from "../create";

interface IProps {
  source?: any;
}

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
    }
  }
`;

export const recoverImage = gql`
  mutation recoverImage($input: RecoverImageInput!) {
    recoverImage(input: $input) {
      actionId
    }
  }
`;

function useActionConfig(props?: IProps) {
  const intl = useIntl();
  const doAction = useAction();

  const { handleHttpsDownload } = useHandleHttpsDownload();

  const { data: deletionPolicyData, loading: deletionPolicyLoading } = useQuery(
    GLOBAL_CONFIG,
    {
      variables: {
        category: "image",
        name: "deletionPolicy",
      },
    },
  );

  const isDelay = useMemo(() => {
    if (deletionPolicyLoading) {
      return true;
    }
    return deletionPolicyData?.globalConfig?.value !== "Direct";
  }, [deletionPolicyData, deletionPolicyLoading]);

  const recover = useCallback(
    async (selectedList: IImage[], setSelectedList) => {
      setSelectedList?.([]);
      if (selectedList.length) {
        const payload: IRecoverImagePayload[] = selectedList.map((item) => {
          return {
            imageUuid: item?.uuid,
            backupStorageUuids: map(
              item?.backupStorageRefs,
              "backupStorageUuid",
            ),
          };
        });
        doAction({
          mutation: recoverImage,
          payload,
          name: intl.formatMessage({
            id: "recover.image",
            defaultMessage: "Recover Image",
          }),
          total: selectedList.length,
          type: "Image",
        });
      }
    },
    [intl, doAction],
  );

  const copyToClip = useCallback(
    (selectedList: IImage[]) => {
      const aux = document.createElement("input");
      const url = selectedList?.[0].backupStorageRefs?.[0].exportUrl || "";
      if (url) {
        aux.setAttribute("value", url);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        message.success({
          content: intl.formatMessage({
            id: "image.action.copy.url.success.message",
            defaultMessage: "Successfully copied the URL.",
          }),
        });
      } else {
        message.warn({
          content: intl.formatMessage({
            id: "image.action.copy.url.warning.message",
            defaultMessage: "Failed to copy the URL.",
          }),
        });
      }
    },
    [intl],
  );

  // 判断当前镜像存储启用状态和就绪状态是否可以添加镜像
  const { state = "", status = "" } = props?.source || {};
  const options = useMemo<IOption<IImage>>(
    () => [
      {
        key: "add.image",
        autoInjectPreValidator: false,
        disabled: !(status === "Connected" && state === "Enabled"),
        ActionWrapper: (_props) => {
          const { visible, setVisible } = _props;
          const memoizedSelectedList = useMemo(() => [props?.source], []);
          return (
            <CreateModal
              selectedList={memoizedSelectedList}
              visible={visible}
              setVisible={setVisible}
              from="image"
            />
          );
        },
      },
      {
        key: "modify.config",
        preValidators: [verifySingleSelect],
        validators: [verifyZmigrateImage],
        ActionWrapper: ModifyConfig,
      },
      {
        key: "storage.migrate",
        preValidators: [verifySingleSelect],
        validators: [verifyStorageMigrate],
        ActionWrapper: StorageMigrateDrawer,
        description: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "image.action.storage.migration.tooltip",
              defaultMessage: `### Change Image Storage

Supports image migrations between distributed image storage.

- To migrate images, make sure the monitoring nodes of the two distributed image storage are interconnected.
- If you migrate an ISO image to an image storage of another data center, the virtual machine using this image cannot be powered on. You need to detach the ISO image from the virtual machine and then you can power on the VM as expected.
- After the migration, the original data of the image will be retained in the image storage. You can manually clean up the data in the image storage. The data cannot be recovered after it is deleted. Proceed with caution.`,
            })}
          </ReactMarkdown>
        ),
      },
      {
        key: "export.image",
        preValidators: [verifySingleSelect],
        validators: [verifyExport],
        ActionWrapper: ExportModal,
      },
      {
        key: "sync.image",
        preValidators: [verifySyncImage],
        ActionWrapper: SyncImage,
      },
      {
        key: "virtualization.edit.nameandDescription",
        validators: [verifyZmigrateImage],
        ActionWrapper: EditNameDesc,
      },
      {
        key: "set.share.type",
        ActionWrapper: SetShareType,
      },
      {
        key: "virtualization.create.vm",
        validators: [verifyCreateVm],
        ActionWrapper: CreateVm,
      },
      {
        key: "delete",
        name: isDelay
          ? intl.formatMessage({
              id: "move.to.recycle.bin",
              defaultMessage: "Move to Recycle Bin",
            })
          : intl.formatMessage({ id: "delete", defaultMessage: "Delete" }),
        validators: [verifyDelete, verifyZmigrateImage],
        ActionWrapper: DeleteModal,
        notSupportedModal: {
          title: intl.formatMessage({
            id: "image.zmigrate.notSupported",
            defaultMessage: "You cannot migrate a zmigrate image. Delete instead.",
          }),
        },
      },
      {
        key: "recover",
        icon: "redo-fill",
        iconStyle: {
          color: "#5ACA49",
          width: "14px",
        },
        onClick: ({ selectedList, setSelectedList }) =>
          recover(selectedList, setSelectedList),
      },
      {
        key: "expunge",
        icon: "trash-fill",
        iconStyle: {
          color: "#F4454C",
          width: "14px",
        },
        ActionWrapper: ExpungeModal,
      },
      {
        key: "download",
        onClick: ({ selectedList }) => {
          if (window.location.protocol === "https:") {
            handleHttpsDownload(
              selectedList[0]?.backupStorageRefs?.[0].exportUrl,
            );
          } else {
            downloadImageFile(selectedList);
          }
        },
      },
      {
        key: "copy.url",
        preValidators: [verifySingleSelect],
        onClick: ({ selectedList }) => copyToClip(selectedList),
      },
      {
        key: "delete.exported",
        ActionWrapper: DeleteExportedImageModal,
      },
      {
        key: "cancel.share",
        validators: [verifyCancelShare],
        ActionWrapper: CancelShare,
      },
      {
        key: "share.resource",
        autoInjectPreValidator: false,
        ActionWrapper: (shareProps) => <ShareResource {...shareProps} />,
      },
    ],
    [intl, isDelay, props],
  );

  const config = _useActionConfig<IImage>(options);

  return { ...config, gql: imageList };
}

export default useActionConfig;
