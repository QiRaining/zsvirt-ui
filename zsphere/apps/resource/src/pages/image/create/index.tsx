import { gql } from "@apollo/client";
import alova from "@zstack/alova-instance";
import { ImageType } from "@zstack/virtualization-resource/src/pages/image/type/image-type";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import {
  getUploadFileMetadata,
  registerUploadSession,
  useAction,
  useUploadAutoResume,
  useUploadTargetTime,
  updateUploadSession,
} from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { ImageMediaType } from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { FileUpload, simpleHash } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import { cloneDeep as _cloneDeep } from "lodash-es";
import React, { useCallback, useRef } from "react";
import { useIntl } from "react-intl";

import BasicCard from "./basic-config";
import SelectImageFileCard from "./select-image-file";

import style from "./style.module.less";

const addImage = gql`
  mutation addImage($input: AddImageInput!) {
    addImage(input: $input) {
      actionId
      jobResult
      transit
    }
  }
`;
interface ICommon {
  backupStorage: IBackupStorage;
  name: string;
  description?: string;
  imageType: ImageType;
  mediaType: ImageMediaType;
  format: string;
  backupStorageUuids: Array<string>;
  url: string;
  dragger: string;
  urlType: "url" | "local";
}

interface IProps {
  from: "image" | "backupStorage";
}

const AddImageModal: React.FC<
  Omit<
    IActionWrapperProps<IBackupStorage>,
    "view" | "position" | "setSelectedList"
  > &
    IProps
> = ({ visible, setVisible, selectedList = [] }) => {
  const intl = useIntl();
  const doAction = useAction();
  const [form] = Form.useForm();
  const initialBasicValues: ICommon = {
    backupStorage: selectedList?.[0],
    name: "",
    description: "",
    imageType: ImageType.system,
    mediaType: ImageMediaType.RootVolumeTemplate,
    format: "qcow2",
    backupStorageUuids: [],
    url: "",
    dragger: "",
    urlType: "url",
  };
  const formRef = React.createRef<FormInstance>();
  const fileWrap = useRef<any>(null);
  const fileName = useRef<string>();
  const { fileResume, setFileResume } = usePlatformStore();
  const getUploadTargetTime = useUploadTargetTime();
  const getUploadAutoResumeConfig = useUploadAutoResume();

  const transformData = (data: any) => {
    const {
      imageType: _imageType,
      dragger: _dragger,
      backupStorage,
      ...params
    } = data;
    if (data?.urlType === "url") {
      params.url = data?.url;
    } else {
      params.url = fileName.current;
    }
    const backupStorageUuids = [backupStorage?.uuid];
    params.backupStorageUuids = backupStorageUuids;
    if (data.imageType === ImageType.system) {
      if (data.format === "iso") {
        params.mediaType = "ISO";
      } else {
        params.mediaType = ImageMediaType.RootVolumeTemplate;
      }
    } else {
      params.mediaType = ImageMediaType.DataVolumeTemplate;
    }
    params.system = false;
    return params;
  };
  const submitHandle = useCallback(
    (data) => {
      const { urlType, ...payload } = _cloneDeep(transformData(data));
      const addImageActionName = intl.formatMessage({
        id: "add.image",
        defaultMessage: "Add Image",
      });
      if (urlType === "url") {
        doAction({
          mutation: addImage,
          payload,
          name: addImageActionName,
          total: 1,
          type: "Image",
        });
        return null;
      }

      // 本地上传：立即返回让 Modal 关闭，hash 计算与上传放到后台执行
      // 后台任务不能阻塞 onOk；失败通过 console.error 记录（doAction/FileUpload 内部已有用户可见的任务状态反馈）
      const fileForUpload = fileWrap.current;
      void (async () => {
        try {
          const hash = await simpleHash(fileForUpload);
          const fileMetadata = getUploadFileMetadata(fileForUpload);
          const backgroundPayload = { ...payload, hash };
          const registerCurrentUploadSession = (
            longJobUuid: string,
            artifactUuid: string,
            uploadUrl: string,
            offset: number,
          ) => {
            void registerUploadSession({
              uploadType: "image",
              hash,
              ...fileMetadata,
              longJobUuid,
              artifactUuid,
              uploadUrl,
              offset,
              status: "UPLOADING",
              jobName: "APIAddImageMsg",
              jobData: JSON.stringify(backgroundPayload),
              actionName: addImageActionName,
              resourceType: "Image",
            }).catch(() => null);
          };

          const _resp = await alova.Get(`/api/uploadhashcheck/${hash}`).send();
          const next = _resp.offset;
          const longJobUuid = _resp.longJobUuid as string;
          const targetUploadTime = await getUploadTargetTime("image");
          const uploadAutoResumeConfig = getUploadAutoResumeConfig({
            uploadType: "image",
            hash,
            hashCheckPath: `/api/uploadhashcheck/${hash}`,
            jobId: longJobUuid,
          });

          // remote has fragment
          if (next) {
            const currentProcess = fileResume[longJobUuid];
            // current context still has the upload object
            if (currentProcess) {
              currentProcess.setTargetUploadTime(targetUploadTime);
              void updateUploadSession(longJobUuid, {
                status: "UPLOADING",
                offset: next,
              }).catch(() => null);
              currentProcess.resume(next);
              return;
            }
            // current context has no upload object, maybe user has refresh browser,need get the longjob parameter from api
            registerCurrentUploadSession(
              _resp.longJobUuid,
              _resp.imageUuid,
              _resp.imageUploadUrl,
              next,
            );
            const newUpload = new FileUpload(
              fileForUpload,
              _resp.imageUploadUrl,
              _resp.longJobUuid,
              _resp.imageUuid,
              next,
              "image",
              undefined,
              { targetUploadTime, ...uploadAutoResumeConfig },
            );
            newUpload.launch();
            const obj: { [key: string]: any } = {};
            obj[_resp.longJobUuid as string] = newUpload;
            obj[hash as string] = newUpload;
            setFileResume({ ...fileResume, ...obj });
            return;
          }

          // absolute new file
          const resp = await doAction({
            mutation: addImage,
            payload: backgroundPayload,
            name: addImageActionName,
            total: 1,
            type: "Image",
          });

          const temp = JSON.parse(resp.data.addImage.jobResult);
          const url = temp.inventory.backupStorageRefs[0].installPath;
          const { imageUuid } = temp.inventory.backupStorageRefs[0];
          const uuid = temp.realUuid;
          registerCurrentUploadSession(uuid, imageUuid, url, 0);
          const newUploadAutoResumeConfig = getUploadAutoResumeConfig({
            uploadType: "image",
            hash,
            hashCheckPath: `/api/uploadhashcheck/${hash}`,
            jobId: uuid,
          });
          const newProcess = new FileUpload(
            fileForUpload,
            url,
            uuid,
            imageUuid,
            0,
            "image",
            undefined,
            { targetUploadTime, ...newUploadAutoResumeConfig },
          );
          newProcess.launch();
          const obj: { [key: string]: any } = {};
          obj[uuid as string] = newProcess;
          obj[hash as string] = newProcess;
          setFileResume({ ...fileResume, ...obj });
        } catch (error) {
          console.error(
            "[AddImage] local upload background task failed:",
            error,
          );
        }
      })();
      return null;
    },
    [
      doAction,
      fileResume,
      intl,
      setFileResume,
      getUploadTargetTime,
      getUploadAutoResumeConfig,
    ],
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "add.image",
        defaultMessage: "Add Image",
      })}
      form={form}
      widthClassName="w-150"
      visible={visible}
      setVisible={setVisible}
      className={style["create-modal"]}
      onOk={submitHandle}
      onCancel={() => setVisible(false)}
    >
      <Form
        form={form}
        ref={formRef}
        className={style.form}
        initialValues={initialBasicValues}
      >
        <SelectImageFileCard
          form={form}
          handleFile={(obj: any) => {
            fileWrap.current = obj;
          }}
          fileName={fileName}
          backupStorage={selectedList?.[0]}
        />
        <BasicCard form={form} />
      </Form>
    </DialogForm>
  );
};

export default AddImageModal;
