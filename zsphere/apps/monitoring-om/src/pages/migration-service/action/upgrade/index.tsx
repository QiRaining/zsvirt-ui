import { gql } from "@apollo/client";
import { Input } from "@zstack/design";
import { Form, Radio, Upload } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import { useUploadPackage } from "@zstack/zsphere-hooks";
import { isSystemPath } from "@zstack/zsphere-utils";
import React, { useCallback, useMemo, useRef } from "react";
import { useIntl } from "react-intl";

import {
  extractVersionFromName,
  compareVersion,
  isTarGzFile,
} from "../../utils";
import {
  buildCleanupUpgradePackageAction,
  buildUpgradeMigrationServiceAction,
} from "./action-request";
import {
  executeUpgradeRequest,
  runUpgradeAfterSuccessfulCleanup,
} from "./orchestration";
import { buildUpgradeMigrationServicePayload } from "./payload";

const UPGRADE_MIGRATION_SERVICE = gql`
  mutation upgradeMigrationService($input: UpgradeMigrationServiceInput!) {
    upgradeMigrationService(input: $input) {
      actionId
      jobResult
      transit
    }
  }
`;

const CLEAN_UPGRADE_SOFTWARE_PACKAGE = gql`
  mutation cleanUpgradeSoftwarePackage(
    $input: CleanUpgradeSoftwarePackageInput!
  ) {
    cleanUpgradeSoftwarePackage(input: $input) {
      actionId
    }
  }
`;

type UpgradeMethod = "useExisting" | "reupload";
type UploadMethod = "url" | "local";

interface UpgradeModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  serviceVersion?: string;
  onActionStartPolling?: () => void;
  /** true = 重新升级模式（显示升级方式选项），false = 首次升级模式 */
  isRetry?: boolean;
  /** SoftwarePackage UUID，升级 API 必需 */
  softwarePackageUuid?: string;
  /** SoftwarePackage 当前状态，用于决定重新升级时的可用操作 */
  softwarePackageStatus?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  setVisible,
  serviceVersion,
  onActionStartPolling,
  isRetry = false,
  softwarePackageUuid,
  softwarePackageStatus,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const fileRef = useRef<File | null>(null);
  const doAction = useAction();

  /**
   * UpgradeExecuteFailed: 可以 Reexecute（使用现有升级包）或重新上传
   * UpgradePackageUploadFailed: 只能重新上传（镜像不完整，无法 Reexecute）
   */
  const canReexecute =
    isRetry && softwarePackageStatus === "UpgradeExecuteFailed";

  /** 校验包名中的版本号是否高于当前已安装版本，不允许降级或同版本升级 */
  const validatePackageVersion = useMemo(() => {
    return (packageName: string): string | null => {
      if (!serviceVersion || !packageName) return null;
      const pkgVersion = extractVersionFromName(packageName);
      if (!pkgVersion) return null; // 无法提取版本号时不阻止，由后端兜底
      if (compareVersion(pkgVersion, serviceVersion) <= 0) {
        return intl.formatMessage(
          {
            id: "migration.upgrade.version.too.low",
            defaultMessage:
              "The installation package version ({pkgVersion}) cannot be lower than or equal to the current version ({currentVersion}). Downgrades are not supported.",
          },
          { pkgVersion, currentVersion: serviceVersion },
        );
      }
      return null;
    };
  }, [serviceVersion, intl]);

  const uploadPackage = useUploadPackage({
    uploadType: "migrationServicePackage",
    recovery: {
      mode: "session",
      hashCheckEndpoint: "/api/uploadMigrationServicePackagehashcheck",
    },
    mutation: UPGRADE_MIGRATION_SERVICE,
    mutationResponseKey: "upgradeMigrationService",
    actionName: intl.formatMessage({
      id: "migration.upgrade.service",
      defaultMessage: "Upgrade Migration Service",
    }),
    jobName: "APIUploadAndExecuteSoftwareUpgradePackageMsg",
    resourceType: "MigrationService",
    buildPayload: (formData, fileName) =>
      buildUpgradeMigrationServicePayload({
        softwarePackageUuid: softwarePackageUuid || "",
        upgradeType: "Normal",
        uploadMethod: formData.uploadMethod as UploadMethod,
        url: formData.url as string | undefined,
        installPath: formData.installPath as string | undefined,
        fileName,
      }),
  });

  const title = isRetry
    ? intl.formatMessage({
        id: "migration.retry.upgrade.service",
        defaultMessage: "Re-upgrade Migration Service",
      })
    : intl.formatMessage({
        id: "migration.upgrade.service",
        defaultMessage: "Upgrade Migration Service",
      });

  const submitHandle = useCallback(
    async (_data: Record<string, unknown>) => {
      onActionStartPolling?.();
      const { upgradeMethod, uploadMethod, url, dragger, installPath } = _data;

      // canReexecute 模式下有 upgradeMethod 字段，其他情况行为等同于 reupload
      const effectiveUpgradeMethod: UpgradeMethod = canReexecute
        ? (upgradeMethod as UpgradeMethod)
        : "reupload";

      // upgradeType 对应 API 的升级类型：Normal（首次/重新上传）或 Reexecute（使用现有包）
      const upgradeType =
        effectiveUpgradeMethod === "useExisting" ? "Reexecute" : "Normal";

      const fileName =
        effectiveUpgradeMethod === "reupload"
          ? uploadMethod === "url"
            ? (url as string).split("/").pop()
            : fileRef.current?.name || (dragger as File)?.name
          : undefined;

      const payload = buildUpgradeMigrationServicePayload({
        softwarePackageUuid: softwarePackageUuid || "",
        upgradeType,
        uploadMethod: uploadMethod as UploadMethod,
        url: url as string | undefined,
        installPath: installPath as string | undefined,
        fileName,
      });

      const executeUpgrade = () =>
        executeUpgradeRequest({
          isLocalUpload:
            effectiveUpgradeMethod === "reupload" && uploadMethod === "local",
          submitLocalUpload: () =>
            uploadPackage.submitHandle(_data, fileRef.current),
          submitUrlUpgrade: () =>
            doAction(
              buildUpgradeMigrationServiceAction({
                mutation: UPGRADE_MIGRATION_SERVICE,
                payload,
                name: intl.formatMessage({
                  id: "migration.upgrade.service",
                  defaultMessage: "Upgrade Migration Service",
                }),
              }),
            ),
        });

      // 重新上传模式下，先清理旧的升级包，清理完成后再执行升级
      let execution: Promise<unknown>;
      if (
        isRetry &&
        effectiveUpgradeMethod === "reupload" &&
        softwarePackageUuid
      ) {
        execution = runUpgradeAfterSuccessfulCleanup({
          executeUpgrade,
          submitCleanup: (onFinish) =>
            doAction(
              buildCleanupUpgradePackageAction({
                mutation: CLEAN_UPGRADE_SOFTWARE_PACKAGE,
                softwarePackageUuid,
                name: intl.formatMessage({
                  id: "migration.clean.upgrade.package",
                  defaultMessage: "Cleanup Upgrade Package",
                }),
                onFinish,
              }),
            ),
        });
      } else {
        execution = executeUpgrade();
      }

      await execution;
    },
    [
      canReexecute,
      doAction,
      intl,
      isRetry,
      onActionStartPolling,
      softwarePackageUuid,
      uploadPackage,
    ],
  );

  const onCancel = () => {
    fileRef.current = null;
  };

  const initialValues = canReexecute
    ? {
        upgradeMethod: "useExisting" as UpgradeMethod,
        uploadMethod: "url" as UploadMethod,
        installPath: "/zmigrate/package",
      }
    : {
        uploadMethod: "url" as UploadMethod,
        installPath: "/zmigrate/package",
      };

  /** 上传方式 + URL/本地上传 字段组 */
  const renderUploadFields = () => (
    <>
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
        {({ getFieldValue: getField }) =>
          getField("uploadMethod") === "url" ? (
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
                    const versionError = validatePackageVersion(fileName);
                    if (versionError) {
                      return Promise.reject(versionError);
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
                    const versionError = validatePackageVersion(value.name);
                    if (versionError) {
                      return Promise.reject(versionError);
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
    </>
  );

  const alertMessage = isRetry
    ? intl.formatMessage({
        id: "migration.retry.upgrade.alert",
        defaultMessage:
          "If you need to reupload the migration service upgrade package, ensure the image storage has sufficient capacity.",
      })
    : intl.formatMessage({
        id: "migration.upgrade.alert",
        defaultMessage:
          "Before uploading the migration service upgrade package, ensure the image storage has sufficient free space and no active migration tasks are running. We recommend manually verifying the task status before proceeding.",
      });

  return (
    <DialogForm
      title={title}
      visible={visible}
      setVisible={setVisible}
      onCancel={onCancel}
      form={form}
      onOk={submitHandle}
      alertType="info"
      alertMessage={alertMessage}
    >
      <Form form={form} initialValues={initialValues}>
        <Form.Item
          label={intl.formatMessage({
            id: "migration.service.version",
            defaultMessage: "Migration Service Version",
          })}
        >
          {serviceVersion || "-"}
        </Form.Item>

        {canReexecute ? (
          <>
            <Form.Item
              name="upgradeMethod"
              label={intl.formatMessage({
                id: "migration.upgrade.method",
                defaultMessage: "Upgrade Method",
              })}
            >
              <Radio.Group
                options={[
                  {
                    value: "useExisting",
                    label: intl.formatMessage({
                      id: "migration.upgrade.use.existing",
                      defaultMessage: "Use Existing Upgrade Package",
                    }),
                  },
                  {
                    value: "reupload",
                    label: intl.formatMessage({
                      id: "migration.upgrade.reupload",
                      defaultMessage: "Reupload Upgrade Package",
                    }),
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              shouldUpdate={(prev, curr) =>
                prev.upgradeMethod !== curr.upgradeMethod
              }
              noStyle
            >
              {({ getFieldValue }) =>
                getFieldValue("upgradeMethod") === "reupload"
                  ? renderUploadFields()
                  : null
              }
            </Form.Item>
          </>
        ) : (
          renderUploadFields()
        )}
      </Form>
    </DialogForm>
  );
};

export default UpgradeModal;
