import { RadioGroup } from "@zstack/design";
import { ImageType } from "@zstack/virtualization-resource/src/pages/image/type/image-type";
import { Upload } from "@zstack/zsphere-components";
import { AuthHander, Form, Input, useAuth } from "@zstack/zsphere-components";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import { isUrl } from "@zstack/zsphere-utils";
import type { FormInstance } from "antd/es/form";
import { compact as _compact } from "lodash-es";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import style from "../basic-config/style.module.less";

const { Item } = Form;

interface IProps {
  form: FormInstance;
  handleFile: (file: File) => any;
  fileName: any;
  backupStorage: IBackupStorage;
}

const BasicPart: React.FC<IProps> = ({
  form,
  handleFile,
  fileName,
  backupStorage,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
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

  const [fileList, setFileList] = useState<Array<any>>([]);
  const props = {
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

  // 根据 url或者文件名 自动填入镜像名称, , wizard 也做同样修改
  const autoInputName = () => {
    let nameByUrl = "";
    let nameByDrag = "";
    let ext = "";
    const {
      urlType = "local",
      url,
      dragger,
      imageType,
    } = form.getFieldsValue();
    // url 上传：第一步、过滤url字符串中的最后一个/与最近一个？之间作为文件名；第二步、将上一步得到的文件名去掉最后一个.后缀，没有后缀则整个取第一步的结果。
    if (urlType === "url") {
      const fileNameWithSuffixes = url
        ?.replace(/(.*\/)((.*)(?!=\/))/gi, `$2`)
        ?.match(/(([^?]*)(?=(.*[?]+.*))|(.*))/i)?.[0];
      [nameByUrl, ext] = _compact(
        fileNameWithSuffixes?.match(/((.*\.*)(?=(.*\.+.*)))|(.*)/gi),
      );
    }

    if (urlType === "local") {
      // 本地上传：将文件名去掉最后一个.后缀，没有后缀则整个文件名。
      [nameByDrag, ext] =
        dragger?.fileList?.length > 0
          ? _compact(
              dragger?.file?.name?.match(/((.*\.*)(?=(.*\.+.*)))|(.*)/gi),
            )
          : ["", ""];
    }

    // 自动填入的名字长度不超过 128
    const autoName = (urlType === "url" ? nameByUrl : nameByDrag)?.substring(
      0,
      128,
    );
    // 当前name输入框的值
    const currentName = form?.getFieldValue("name");
    // 用户自定义输入则不用自动填入
    if (
      currentName &&
      nameByUrl !== currentName &&
      nameByDrag !== currentName
    ) {
      return;
    }
    // 如果用户已手动选择过镜像格式，则不要再被 autoInputName 覆盖（避免校验/提交时回滚）
    const hasTouchedFormat =
      typeof (form as any)?.isFieldTouched === "function"
        ? (form as any).isFieldTouched("format")
        : false;
    const currentFormat = form?.getFieldValue("format");
    const nextFormat =
      ["qcow2", "iso"].includes(ext) && imageType === ImageType.system
        ? ext
        : "qcow2";
    // 非用户自定义输入则使用自动填入
    form.setFieldsValue({
      name: autoName,
      ...(hasTouchedFormat || currentFormat ? {} : { format: nextFormat }),
    });
  };

  return (
    <div className={style.card}>
      <div className={style.title}>
        <div className={style.rect} />
        <div className={style.text}>
          {intl.formatMessage({
            id: "select.image.file",
            defaultMessage: "Select Image File",
          })}
        </div>
      </div>
      <Item
        name="backupStorage"
        label={intl.formatMessage({
          id: "backupStorage",
          defaultMessage: "Image Storage",
        })}
      >
        {backupStorage?.name}
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
                    autoInputName();

                    return Promise.resolve();
                  },
                },
              ]}
              required
            >
              <Input
                className={style["width-320"]}
                onChange={() => form.resetFields(["name"])}
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
                      form.resetFields(["name"]);
                      return Promise.reject(
                        intl.formatMessage({
                          id: "image.field.templateImport.validator.format",
                          defaultMessage: "Upload a file.",
                        }),
                      );
                    }

                    // 根据本地上传的文件名自动填入镜像名称,
                    autoInputName();

                    return Promise.resolve();
                  },
                }),
              ]}
              required
            >
              <Upload
                multipleSelect={false}
                {...props}
                accept=".qcow2,.iso,.vmdk,.raw"
                fileList={fileList}
              />
            </Item>
          )
        }
      </Item>
    </div>
  );
};

export default React.memo(BasicPart);
