import { Icon } from "@zstack/icon";
import { Item } from "@zstack/zsphere-types";
import { Upload as AntUpload, Button, Tooltip } from "antd";
import React from "react";
import { useIntl } from "react-intl";

import { getBaseCls } from "../../_utils/common";
import Text from "../text";
import type { IUploadProps, IDraggerProps, IUploadFile } from "./type";

import "./style.less";

const baseDraggerCls = getBaseCls("upload-dragger");

function UploadWrapper<T extends Item>(
  props: Omit<IUploadProps<T>, "text"> & { children: React.ReactNode },
) {
  const intl = useIntl();

  const ref = React.useRef<any>(null);
  const { checkText = "", onCheck, children, ...otherProps } = props;

  // 暂时没有找到其他删除的方法
  const onRemoveClick = (index: number) => {
    ref?.current
      ?.querySelectorAll?.(
        'button[class~="ant-upload-list-item-card-actions-btn"] span[aria-label="delete"]',
      )
      ?.[index]?.parentElement?.click();
  };

  const getAttachIcon = (file: any) => {
    const iconMap: any = {
      error: <Icon type="close-circle-fill" color="danger" />,
      loading: <Icon type="loader" color="info" />,
      success: <Icon type="checkmark-circle-fill" color="positive" />,
      default: <Icon type="file-text-fill" color="info" />,
    };
    return iconMap?.[file?.validateResult?.type] ?? iconMap.default;
  };

  return (
    <div className={baseDraggerCls} ref={ref}>
      {children}
      {otherProps.showUploadList !== false &&
        otherProps.fileList?.map((file: IUploadFile<T>, index: number) => (
          <div className={`${baseDraggerCls}-file-item`} key={index}>
            <div className={`${baseDraggerCls}-file-item-line`}>
              <span className={`${baseDraggerCls}-file-item-line-attach-icon`}>
                {getAttachIcon(file)}
              </span>
              <span className={`${baseDraggerCls}-file-item-line-name`}>
                <Text value={file.name} />
              </span>
              {onCheck && (
                <span
                  className={`${baseDraggerCls}-file-item-line-check`}
                  onClick={() => onCheck(index)}
                >
                  <Tooltip
                    title={
                      checkText ||
                      intl.formatMessage({
                        id: "check.grammar",
                        defaultMessage: "Check Grammar",
                      })
                    }
                  >
                    <Icon type="audit" />
                  </Tooltip>
                </span>
              )}
              <span
                className={`${baseDraggerCls}-file-item-line-trash-icon`}
                onClick={() => onRemoveClick(index)}
              >
                <Icon type="trash" />
              </span>
            </div>
            {file.errorMessage && (
              <div className={`${baseDraggerCls}-file-item-line-error`}>
                <Text value={file.errorMessage} />
              </div>
            )}
            {file?.validateResult?.type === "error" && (
              <div className={`${baseDraggerCls}-file-item-line-error`}>
                <Text value={file?.validateResult?.message} />
              </div>
            )}
            {file?.validateResult?.type === "loading" && (
              <div className={`${baseDraggerCls}-file-item-line-info`}>
                <Text value={file?.validateResult?.message} />
              </div>
            )}
            {file?.validateResult?.type === "success" && (
              <div className={`${baseDraggerCls}-file-item-line-info`}>
                <Text value={file?.validateResult?.message} />
              </div>
            )}
          </div>
        ))}
    </div>
  );
}

function Upload<T extends Item>(props: IUploadProps<T>) {
  const intl = useIntl();

  const {
    acceptText = "",
    text = "",
    imageSize = "small",
    ...otherProps
  } = props;

  return props?.listType === "picture-card" ? (
    <div
      className={`${baseDraggerCls}-image-container ${baseDraggerCls}-image-container-${imageSize}`}
    >
      <AntUpload
        showUploadList={{
          showPreviewIcon: false,
          showRemoveIcon: true,
          removeIcon: <Icon type="trash" />,
        }}
        {...otherProps}
      >
        {props?.fileList?.length === 0 && (
          <div className={`${baseDraggerCls}-add-image`}>
            <Icon type="cloud-upload" />
            <div>
              {intl.formatMessage({
                id: "click.and.upload.image",
                defaultMessage: "Click here to upload",
              })}
            </div>
          </div>
        )}
      </AntUpload>
      {acceptText && (
        <span className={`${baseDraggerCls}-file-accept-message`}>
          {acceptText}
        </span>
      )}
    </div>
  ) : (
    <UploadWrapper {...otherProps} acceptText={acceptText}>
      <AntUpload {...otherProps}>
        <Button>
          <Icon type="cloud-upload" />
          {text ||
            intl.formatMessage({
              id: "upload.file",
              defaultMessage: "Upload File",
            })}
        </Button>
        {acceptText && (
          <span className={`${baseDraggerCls}-file-accept-message`}>
            {acceptText}
          </span>
        )}
      </AntUpload>
    </UploadWrapper>
  );
}

function Dragger<T extends Item>(props: IDraggerProps<T>) {
  const intl = useIntl();

  const { acceptText = "", text = "", ...otherProps } = props;

  return (
    <UploadWrapper {...otherProps}>
      <AntUpload.Dragger {...otherProps}>
        <Icon type="cloud-upload" className={`${baseDraggerCls}-icon`} />
        <span>
          {text ||
            intl.formatMessage({
              id: "upload.file/drag.file",
              defaultMessage: "Upload or drop your file here",
            })}
        </span>
        {acceptText && (
          <div className={`${baseDraggerCls}-file-accept-message`}>
            {acceptText}
          </div>
        )}
      </AntUpload.Dragger>
    </UploadWrapper>
  );
}

Upload.Dragger = Dragger;

export default Upload;

export type { IUploadProps, IDraggerProps, IUploadFile };
