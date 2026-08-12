import { gql } from "@apollo/client";
import alova from "@zstack/alova-instance";
import { RadioGroup } from "@zstack/design";
import {
  InputDebounce,
  Upload,
  AuthHander,
  Form,
  Input,
  Select,
  useAuth,
} from "@zstack/zsphere-components";
import {
  getUploadFileMetadata,
  registerUploadSession,
  useAction,
  useUploadAutoResume,
  useUploadTargetTime,
  useValidator,
  updateUploadSession,
} from "@zstack/zsphere-hooks";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { ImageMediaType } from "@zstack/zsphere-types";
import { FileUpload, isUrl, simpleHash } from "@zstack/zsphere-utils";
import { useDebounceFn } from "ahooks";
import type { FormInstance } from "antd/es/form";
import _ from "lodash-es";
import type { FC } from "react";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { useShallow } from "zustand/react/shallow";

import { useWizardStore } from "../../layouts/wizard-container/wizard-container";
import type { IWizardFormProps } from "../interface";

import style from "./style.module.less";

enum ImageType {
  system = "system",
  volume = "volume",
}

const addImage = gql`
  mutation addImage($input: AddImageInput!) {
    addImage(input: $input) {
      actionId
      jobResult
      transit
    }
  }
`;

const { Item } = Form;
const { Option } = Select;

interface IImageCreatorProps extends IWizardFormProps {}

export const ImageCreator: FC<IImageCreatorProps> = forwardRef((props, ref) => {
  const { handleTaskFinished } = props;
  const intl = useIntl();

  const doAction = useAction();
  const [form] = Form.useForm();

  const initialBasicValues = {
    name: "zstack-image-1.4",
    description: "",
    imageType: ImageType.system,
    mediaType: ImageMediaType.RootVolumeTemplate,
    format: "qcow2",
    backupStorageUuids: [],
    url: "file:///opt/zstack-dvd/zstack-image-1.4.qcow2",
    dragger: "",
    urlType: "url",
  };
  const formRef = React.createRef<FormInstance>();
  const fileWrap = useRef<any>(null);
  const fileName = useRef<string>();
  const { fileResume, setFileResume } = usePlatformStore();
  const getUploadTargetTime = useUploadTargetTime();
  const getUploadAutoResumeConfig = useUploadAutoResume();

  const { backupStorageUuid, backupStorageName } = useWizardStore(
    useShallow((state) => ({
      backupStorageUuid: state.backupStorageUuid,
      backupStorageName: state.backupStorageName,
    })),
  );

  const { run: autoInputName } = useDebounceFn(
    () => {
      let name = "";
      let ext = "";
      const {
        urlType = "local",
        url,
        dragger,
        imageType,
      } = form.getFieldsValue();
      if (urlType === "url") {
        // url 上传：第一步、过滤url字符串中的最后一个/与最近一个？之间作为文件名；第二步、将上一步得到的文件名去掉最后一个.后缀，没有后缀则整个取第一步的结果。
        const fileNameWithSuffixes = url
          ?.replace(/(.*\/)((.*)(?!=\/))/gi, `$2`)
          ?.match(/(([^?]*)(?=(.*[?]+.*))|(.*))/i)?.[0];
        [name, ext] = _.compact(
          fileNameWithSuffixes?.match(/((.*\.*)(?=(.*\.+.*)))|(.*)/gi),
        );
      } else {
        // 本地上传：将文件名去掉最后一个.后缀，没有后缀则整个文件名。
        [name, ext] =
          dragger?.fileList?.length > 0
            ? _.compact(
                dragger?.file?.name?.match(/((.*\.*)(?=(.*\.+.*)))|(.*)/gi),
              )
            : "";
      }
      // 自动填入的名字长度不超过 128
      form.setFieldsValue({
        name: name?.substring(0, 128),
        format:
          ["qcow2", "iso"].includes(ext) && imageType === ImageType.system
            ? ext
            : "qcow2",
      });
    },
    { wait: 800, leading: true },
  );

  const submit = async () => {
    await form.validateFields();
    form.submit();
  };

  useImperativeHandle(ref, () => ({
    submit,
  }));

  const transformData = (data: any) => {
    const {
      imageType: _imageType,
      dragger: _dragger,
      backupStorage: _backupStorage,
      ...params
    } = data;
    if (data?.urlType === "url") {
      params.url = data?.url;
    } else {
      params.url = fileName.current;
    }
    params.backupStorageUuids = [backupStorageUuid];
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
    async (data) => {
      const { urlType, ...payload } = _.cloneDeep(transformData(data));
      const addImageActionName = intl.formatMessage({
        id: "add.image",
        defaultMessage: "Add Image",
      });
      let _resolve: Function;
      let _promise: Promise<any>;
      if (urlType === "url") {
        doAction({
          mutation: addImage,
          payload,
          name: addImageActionName,
          total: 1,
          type: "Image",
          onFinish: handleTaskFinished,
        });
        _promise = new Promise((resolve) => {
          _resolve = resolve;
        });
        return null;
      }
      const hash = await simpleHash(fileWrap.current);
      const fileMetadata = getUploadFileMetadata(fileWrap.current);
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
      payload.hash = hash;
      const { data: _resp } = await alova
        .Get<{ data: any }>(`/api/uploadhashcheck/${hash}`, {
          headers: { "x-session-id": localStorage.getItem("sessionId") || "" },
        })
        .send();
      const next = _resp.offset;
      //todo actionId
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
        }
        // current context has no upload object, maybe user has refresh browser,need get the longjob parameter from api
        else {
          registerCurrentUploadSession(
            _resp.longJobUuid,
            _resp.imageUuid,
            _resp.imageUploadUrl,
            next,
          );
          const newUpload = new FileUpload(
            fileWrap.current,
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
          // set upload object into fileResume
          setFileResume({ ...fileResume, ...obj });
        }
        _promise = Promise.resolve();
      }
      // absolute new file
      else {
        try {
          const resp = await doAction({
            mutation: addImage,
            payload,
            name: addImageActionName,
            total: 1,
            type: "Image",
            onFinish: handleTaskFinished,
          });
          _promise = new Promise((resolve) => {
            _resolve = resolve;
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
            fileWrap.current,
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
          // set upload object into fileResume
          setFileResume({ ...fileResume, ...obj });
        } catch (e) {
          console.info(e);
          _promise = Promise.reject();
        }
      }
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

  const { commonNameRules } = useValidator(intl);

  const { hasAuth } = useAuth();

  const volumeImageAuth = {
    type: "block" as const,
    resource: "image",
    authKey: "volume.image",
  };
  const localUploadImageAuth = {
    type: "block" as const,
    resource: "image",
    authKey: "local.upload.image",
  };

  const imagePathtooltipAuth = {
    type: "block" as const,
    resource: "image",
    authKey: "image.path.tooltip",
  };

  const handleFile = (obj: any) => {
    fileWrap.current = obj;
  };

  const [fileList, setFileList] = useState<Array<any>>([]);
  const draggerProps = {
    name: "file",
    multiple: false,
    onRemove() {
      setFileList([]);
    },
    beforeUpload: async (file: File) => {
      fileName.current = `upload://${file.name}`;
      handleFile(file);
      setFileList([
        {
          uid: "1",
          name: file.name,
          status: "done",
          errorMessage: "",
        },
      ]);
      throw undefined;
    },
  };

  return (
    <Form
      form={form}
      ref={formRef}
      initialValues={initialBasicValues}
      onFinish={submitHandle}
    >
      <Item
        name="backupStorage"
        label={intl.formatMessage({
          id: "backupStorage",
          defaultMessage: "Image Storage",
        })}
        textFormItem
      >
        {backupStorageName}
      </Item>

      <Item
        shouldUpdate={(prev, curr) => prev.backupStorage !== curr.backupStorage}
      >
        {({ getFieldValue }) => {
          const bsData = getFieldValue("backupStorage");
          return (
            <Item
              name="urlType"
              label={intl.formatMessage({
                id: "imagePath",
                defaultMessage: "Image Path",
              })}
              className={style.typeRadio}
              icon={hasAuth(imagePathtooltipAuth) ? "info" : undefined}
              iconTooltip={
                hasAuth(imagePathtooltipAuth) && (
                  <AuthHander {...imagePathtooltipAuth}>
                    <ReactMarkdown>
                      {intl.formatMessage({
                        id: "image.field.imagePath.tooltip",
                        defaultMessage: `### Image Path

#### URL

1. Use the specified URL to add images.
2. Supported formats:
    - HTTP/HTTPS/FTP/SFTP. Examples:
        - http://host[:port]/path/file
        - https://host[:port]/path/file
        - ftp://[user:password@]hostname[:port]/path/file
        - sftp://user[:password]@hostname[:port]/path/file
    - The absolute path on an image storage, which supports standalone image storage. Examples:
        - file:///path/file
3. Make sure that the URL you entered here can be accessed by the image storage, and the image file is available.
4. If you use the SFTP format with no password specified, make sure that you can SSH to the specified host without a password.

#### Local File

1. Upload an image file that can be accessed by your current browser. Note that standalone image storage and distributed image storage are supported.
2. Select a file that matches the format of the selected image.`,
                      })}
                    </ReactMarkdown>
                  </AuthHander>
                )
              }
            >
              <RadioGroup
                onValueChange={() => {
                  autoInputName();
                  setFileList([]);
                  form.resetFields([
                    "name",
                    "description",
                    "url",
                    "format",
                    "imageType",
                  ]);
                }}
                options={[
                  {
                    value: "url",
                    label: intl.formatMessage({
                      id: "url",
                      defaultMessage: "URL",
                    }),
                  },
                  ...((!bsData?.[0]?.type ||
                    ["Ceph", "ImageStoreBackupStorage"].includes(
                      bsData?.[0]?.type,
                    )) &&
                  hasAuth(localUploadImageAuth)
                    ? [
                        {
                          value: "local",
                          label: (
                            <AuthHander {...localUploadImageAuth}>
                              {intl.formatMessage({
                                id: "local.file.upload",
                                defaultMessage: "Local File",
                              })}
                            </AuthHander>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </Item>
          );
        }}
      </Item>

      <Item
        shouldUpdate={(prev, curr) =>
          prev.urlType !== curr.urlType || prev.format !== curr.format
        }
        noStyle
      >
        {({ getFieldValue }) =>
          getFieldValue("urlType") === "url" ? (
            <Item
              name="url"
              label="URL"
              validateTrigger={["onBlur", "onChange"]}
              rules={[
                {
                  validator(rule, value: string) {
                    if (!value) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "global.field.validator.input.required",
                          defaultMessage: "This field is required.",
                        }),
                      );
                    }

                    if (!isUrl(value, "image")) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "image.field.imagePath.validator.format",
                          defaultMessage: "Invalid image path.",
                        }),
                      );
                    }
                    if (
                      getFieldValue("format") === "vmdk" &&
                      !value.endsWith(".vmdk")
                    ) {
                      return Promise.reject(
                        intl.formatMessage({
                          id: "image.field.vmdkPath.validator.format",
                          defaultMessage: "Upload a VMDK-formatted file.",
                        }),
                      );
                    }
                    // 根据 url 自动填入镜像名称,
                    return Promise.resolve();
                  },
                },
              ]}
              required
            >
              <Input
                className={style["width-320"]}
                onChange={(e) => {
                  if (!e?.target?.value) {
                    form.setFieldsValue({ name: "" });
                  } else {
                    autoInputName();
                  }
                }}
              />
            </Item>
          ) : (
            <Item
              name="dragger"
              label={intl.formatMessage({
                id: "upload.file",
                defaultMessage: "Upload File",
              })}
              rules={[
                {
                  required: true,
                  message: intl.formatMessage({
                    id: "image.field.templateImport.validator.format",
                    defaultMessage: "Upload a file.",
                  }),
                },
                () => ({
                  validator() {
                    const fileValue = getFieldValue("dragger");
                    if (fileValue.fileList.length === 0) {
                      form.setFieldsValue({ name: "" });
                      return Promise.reject(
                        intl.formatMessage({
                          id: "image.field.templateImport.validator.format",
                          defaultMessage: "Upload a file.",
                        }),
                      );
                    }
                    // 根据本地上传的文件名自动填入镜像名称,
                    return Promise.resolve();
                  },
                }),
              ]}
              required
            >
              <Upload
                multipleSelect={false}
                {...draggerProps}
                accept={
                  getFieldValue("format") === "vmdk" ? ".vmdk" : undefined
                }
                fileList={fileList}
                onChange={autoInputName}
              />
            </Item>
          )
        }
      </Item>
      <Item
        label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
        name="name"
        rules={commonNameRules}
        required
      >
        <InputDebounce className={style["width-320"]} />
      </Item>
      <Item
        name="imageType"
        label={intl.formatMessage({
          id: "imageType",
          defaultMessage: "Image Type",
        })}
      >
        <RadioGroup
          options={[
            {
              value: "system",
              label: intl.formatMessage({
                id: "systemImage",
                defaultMessage: "System Image",
              }),
            },
            ...(!!hasAuth(volumeImageAuth)
              ? [
                  {
                    value: "volume",
                    label: (
                      <AuthHander {...volumeImageAuth}>
                        {intl.formatMessage({
                          id: "volumeImage",
                          defaultMessage: "Disk Image",
                        })}
                      </AuthHander>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Item>
      <Item
        shouldUpdate={(prev, curr) => prev.imageType !== curr.imageType}
        noStyle
      >
        {({ getFieldValue }) => {
          return (
            <Item
              name="format"
              label={intl.formatMessage({
                id: "imageFormat",
                defaultMessage: "Image Format",
              })}
            >
              <Select className={style["width-160"]}>
                <Option value="qcow2">qcow2</Option>
                {getFieldValue("imageType") === ImageType.system && (
                  <Option value="iso">iso</Option>
                )}
                <Option value="vmdk">vmdk</Option>
                <Option value="raw">raw</Option>
              </Select>
            </Item>
          );
        }}
      </Item>
    </Form>
  );
});
