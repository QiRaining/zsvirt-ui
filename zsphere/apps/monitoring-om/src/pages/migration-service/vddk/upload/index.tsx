import { gql } from "@apollo/client";
import { Form, Upload } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useUploadPackage } from "@zstack/zsphere-hooks";
import React, { useCallback, useRef, useState } from "react";
import { useIntl } from "react-intl";

import { isTarGzFile } from "../../utils";
import {
  isValidVddkFileName,
  isValidVddkPackageMd5,
  VDDK_DOWNLOAD_URL,
} from "../constants";
import { calculateFileMd5 } from "./vddk-md5";

const ADD_VDDK_PACKAGE = gql`
  mutation addVddkPackage($input: AddVddkPackageInput!) {
    addVddkPackage(input: $input) {
      actionId
      jobResult
      transit
    }
  }
`;

const VDDK_ACCEPT = [".gz", "application/gzip", "application/x-gzip"].join(",");

interface UploadVddkDialogProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onUploadStart?: () => void;
}

const UploadVddkDialog: React.FC<UploadVddkDialogProps> = ({
  visible,
  setVisible,
  onUploadStart,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const fileRef = useRef<File | null>(null);
  const fileMd5CacheRef = useRef(new WeakMap<File, Promise<string>>());
  const [isValidatingMd5, setIsValidatingMd5] = useState(false);
  const { submitHandle: submitVddkPackage } = useUploadPackage({
    uploadType: "migrationServicePackage",
    mutation: ADD_VDDK_PACKAGE,
    mutationResponseKey: "addVddkPackage",
    actionName: intl.formatMessage({
      id: "migration.vddk.upload.action",
      defaultMessage: "Upload VDDK",
    }),
    jobName: "APIUploadSoftwarePackageToVmMsg",
    resourceType: "MigrationService",
    recovery: { mode: "memory" },
    buildPayload: (_formData, fileName) => ({
      url: `upload://${fileName}`,
    }),
  });

  const handleSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      await submitVddkPackage(data, fileRef.current ?? undefined);
      onUploadStart?.();
    },
    [onUploadStart, submitVddkPackage],
  );

  const getFileMd5 = useCallback((file: File): Promise<string> => {
    const cachedMd5 = fileMd5CacheRef.current.get(file);
    if (cachedMd5) {
      return cachedMd5;
    }

    const md5Promise = calculateFileMd5(file);
    fileMd5CacheRef.current.set(file, md5Promise);
    return md5Promise;
  }, []);

  const startMd5Validation = useCallback(
    (file: File | null) => {
      if (!file || !isValidVddkFileName(file.name) || !isTarGzFile(file.name)) {
        setIsValidatingMd5(false);
        return;
      }

      setIsValidatingMd5(true);
      const md5Promise = getFileMd5(file);
      const finishCurrentFileValidation = () => {
        if (fileRef.current === file) {
          setIsValidatingMd5(false);
        }
      };
      void md5Promise.then(
        finishCurrentFileValidation,
        finishCurrentFileValidation,
      );
    },
    [getFileMd5],
  );

  const handleCancel = useCallback(() => {
    fileRef.current = null;
    fileMd5CacheRef.current = new WeakMap();
    setIsValidatingMd5(false);
    form.resetFields?.();
  }, [form]);

  const invalidVddkPackageMessage = intl.formatMessage({
    id: "migration.vddk.package.md5.invalid",
    defaultMessage:
      "The selected file is incorrect. Select the VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux package.",
  });

  const alertMessage = (
    <span>
      {intl.formatMessage({
        id: "migration.vddk.upload.alert",
        defaultMessage:
          "VMware licensing requires users to obtain and upload the VDDK component. We recommend VMware Virtual Disk Development Kit (VDDK) 8.0.3 for Linux.",
      })}
      <a
        className="text-theme-600 ml-1"
        href={VDDK_DOWNLOAD_URL}
        target="_blank"
        rel="noreferrer"
      >
        {intl.formatMessage({
          id: "migration.vddk.download",
          defaultMessage: "Go to Download",
        })}
      </a>
    </span>
  );

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "migration.vddk.upload.title",
        defaultMessage: "Upload VDDK",
      })}
      visible={visible}
      setVisible={setVisible}
      onCancel={handleCancel}
      form={form}
      onOk={handleSubmit}
      alertType="info"
      alertMessage={alertMessage}
      confirmLoading={isValidatingMd5}
    >
      <Form form={form} initialValues={{ uploadMethod: "local" }}>
        <Form.Item name="uploadMethod" hidden />
        <Form.Item
          name="dragger"
          label={intl.formatMessage({
            id: "migration.vddk.package",
            defaultMessage: "VDDK Package",
          })}
          validateTrigger="onChange"
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "upload.file.cannot.be.empty",
                defaultMessage: "Upload a file.",
              }),
            },
            {
              validator(_rule, value: File) {
                if (!value?.name) {
                  return Promise.resolve();
                }
                if (!isValidVddkFileName(value.name)) {
                  return Promise.reject(
                    intl.formatMessage({
                      id: "migration.vddk.package.name.invalid",
                      defaultMessage:
                        "The file name can contain only letters, numbers, periods, underscores, and hyphens.",
                    }),
                  );
                }
                if (isTarGzFile(value.name)) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  intl.formatMessage({
                    id: "migration.vddk.package.suffix.invalid",
                    defaultMessage:
                      "The VDDK package file must end with .tar.gz.",
                  }),
                );
              },
            },
            {
              async validator(_rule, value: File) {
                if (
                  !value?.name ||
                  !isValidVddkFileName(value.name) ||
                  !isTarGzFile(value.name)
                ) {
                  return;
                }

                try {
                  const md5 = await getFileMd5(value);
                  if (isValidVddkPackageMd5(md5)) {
                    return;
                  }
                } catch {
                  // Hash failures use the same field-level validation message.
                }
                throw new Error(invalidVddkPackageMessage);
              },
            },
          ]}
          required
        >
          <Upload.Select
            className="width-320"
            accept={VDDK_ACCEPT}
            onChange={(file: File | null) => {
              fileRef.current = file;
              startMd5Validation(file);
            }}
          />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default UploadVddkDialog;
