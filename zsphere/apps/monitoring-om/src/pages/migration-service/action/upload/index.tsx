import { gql } from "@apollo/client";
import { Input } from "@zstack/design";
import { Form, Radio, Upload } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useUploadPackage } from "@zstack/zsphere-hooks";
import { isSystemPath } from "@zstack/zsphere-utils";
import React, { useCallback, useRef } from "react";
import { useIntl } from "react-intl";

import { isTarGzFile } from "../../utils";
import { buildMigrationPackageUploadPayload } from "./payload";

const ADD_MIGRATION_SERVICE_PACKAGE = gql`
  mutation addMigrationServicePackage(
    $input: AddMigrationServicePackageInput!
  ) {
    addMigrationServicePackage(input: $input) {
      actionId
      jobResult
      transit
    }
  }
`;

interface UploadModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onActionStartPolling?: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  setVisible,
  onActionStartPolling,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const fileRef = useRef<File | null>(null);

  const uploadPackage = useUploadPackage({
    uploadType: "migrationServicePackage",
    recovery: {
      mode: "session",
      hashCheckEndpoint: "/api/uploadMigrationServicePackagehashcheck",
    },
    mutation: ADD_MIGRATION_SERVICE_PACKAGE,
    mutationResponseKey: "addMigrationServicePackage",
    actionName: intl.formatMessage({
      id: "migration.upload.package",
      defaultMessage: "Upload Migration Service Package",
    }),
    jobName: "APIUploadSoftwarePackageToBackupStorageMsg",
    resourceType: "MigrationService",
    buildPayload: (formData, fileName) =>
      buildMigrationPackageUploadPayload(
        {
          uploadMethod: formData.uploadMethod as "url" | "local",
          installPath: formData.installPath as string,
          url: formData.url as string | undefined,
        },
        fileName,
      ),
  });

  const submitHandle = useCallback(
    async (_data: Record<string, unknown>): Promise<void> => {
      onActionStartPolling?.();
      await uploadPackage.submitHandle(_data, fileRef.current ?? undefined);
    },
    [onActionStartPolling, uploadPackage.submitHandle],
  );

  const onCancel = () => {
    fileRef.current = null;
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "migration.upload.package",
        defaultMessage: "Upload Migration Service Package",
      })}
      visible={visible}
      setVisible={setVisible}
      onCancel={onCancel}
      form={form}
      onOk={submitHandle}
      alertType="info"
      alertMessage={intl.formatMessage({
        id: "migration.upload.package.alert",
        defaultMessage:
          "Ensure sufficient storage space on the image storage before uploading the migration service package.",
      })}
    >
      <Form
        form={form}
        initialValues={{
          uploadMethod: "url",
          installPath: "/zmigrate/package",
        }}
      >
        <Form.Item
          name="uploadMethod"
          label={intl.formatMessage({
            id: "upload.method",
            defaultMessage: "Upload By",
          })}
        >
          <Radio.Group
            options={[
              {
                value: "url",
                label: intl.formatMessage({
                  id: "url",
                  defaultMessage: "URL",
                }),
              },
              {
                value: "local",
                label: intl.formatMessage({
                  id: "local.file.upload",
                  defaultMessage: "Local File",
                }),
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          shouldUpdate={(prev, curr) => prev.uploadMethod !== curr.uploadMethod}
          noStyle
        >
          {({ getFieldValue }) =>
            getFieldValue("uploadMethod") === "url" ? (
              <Form.Item
                key="url-field"
                name="url"
                label="URL"
                validateTrigger={["onBlur", "onChange"]}
                rules={[
                  {
                    validator(_rule, value: string) {
                      if (!value) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "global.field.validator.input.required",
                            defaultMessage: "This field is required.",
                          }),
                        );
                      }
                      const fileName = value.split("/").pop() || "";
                      if (!isTarGzFile(fileName)) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "migration.upload.package.suffix.invalid",
                            defaultMessage:
                              "The installation package file must end with .tar.gz",
                          }),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                required
              >
                <Input className="width-320" />
              </Form.Item>
            ) : (
              <Form.Item
                key="dragger-field"
                name="dragger"
                label={intl.formatMessage({
                  id: "installation.package",
                  defaultMessage: "Installation Package",
                })}
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
                      if (!value?.name) return Promise.resolve();
                      if (!isTarGzFile(value.name)) {
                        return Promise.reject(
                          intl.formatMessage({
                            id: "migration.upload.package.suffix.invalid",
                            defaultMessage:
                              "The installation package file must end with .tar.gz",
                          }),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                required
              >
                <Upload.Select
                  className="width-320"
                  onChange={(file: File | null) => {
                    fileRef.current = file;
                  }}
                />
              </Form.Item>
            )
          }
        </Form.Item>
        <Form.Item
          name="installPath"
          label={intl.formatMessage({
            id: "storage.path",
            defaultMessage: "Storage Path",
          })}
          rules={[
            {
              required: true,
              message: intl.formatMessage({
                id: "global.field.validator.input.required",
                defaultMessage: "This field is required.",
              }),
            },
            {
              validator(_, value) {
                if (value && isSystemPath(value)) {
                  return Promise.reject(
                    Error(
                      intl.formatMessage({
                        id: "migration.installPath.validator.systemPath",
                        defaultMessage:
                          "System directories are not allowed. Please enter a different path.",
                      }),
                    ),
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
          required
        >
          <Input className="width-320" />
        </Form.Item>
      </Form>
    </DialogForm>
  );
};

export default UploadModal;
