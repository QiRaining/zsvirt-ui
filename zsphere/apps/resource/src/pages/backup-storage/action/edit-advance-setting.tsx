import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  FieldStack,
  InputNumberField,
  InputUnitField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { BackupStorageType } from "@zstack/zsphere-types";
import type { BackupStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import {
  createBackupStorageAdvancedSettingSchema,
  type BackupStorageAdvancedSettingValues,
} from "./schema";

interface ConfigProps {
  reservedCapacity?: string;
  blobUploadConcurrency?: string;
  blobDownloadConcurrency?: string;
}

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  current?: ConfigProps;
  source: BackupStorage;
  onSubmit: Function;
  resourceName?: string;
}

const normalizeCapacityUnit = (unit?: string) => {
  const upperUnit = unit?.toLocaleUpperCase()?.trim();

  if (!upperUnit) {
    return "GB";
  }

  if (upperUnit === "B" || upperUnit.endsWith("B")) {
    return upperUnit;
  }

  return `${upperUnit}B`;
};

const Action: React.FC<IProps> = ({
  visible,
  setVisible,
  current,
  onSubmit,
  resourceName,
  source,
}) => {
  const intl = useIntl();
  const {
    type,
    poolAvailableCapacity = 0,
    poolUsedCapacity = 0,
    totalCapacity = 0,
  } = source || {};

  const maxSettingCapacity = useMemo(
    () =>
      type === BackupStorageType.Ceph
        ? poolAvailableCapacity + poolUsedCapacity
        : totalCapacity,
    [poolAvailableCapacity, poolUsedCapacity, totalCapacity, type],
  );
  const unitList = useMemo(
    () =>
      ["KB", "MB", "GB", "TB"].map((unit) => ({
        value: unit,
        displayName: unit,
      })),
    [],
  );
  const defaultValues = useMemo<BackupStorageAdvancedSettingValues>(() => {
    const _initialValues = {
      reservedCapacity: { number: 1, unit: "GB" },
      blobUploadConcurrency: "",
      blobDownloadConcurrency: "",
    };
    if (current) {
      if (current?.reservedCapacity) {
        const reservedCapacityNumber = current?.reservedCapacity?.replace(
          /[^0-9.]/gi,
          "",
        );
        const reservedCapacityUnit = current?.reservedCapacity?.split(
          reservedCapacityNumber,
        )?.[1];
        _initialValues.reservedCapacity = {
          number: Number(reservedCapacityNumber),
          unit: normalizeCapacityUnit(reservedCapacityUnit),
        };
      }
      _initialValues.blobUploadConcurrency =
        current?.blobUploadConcurrency || "";
      _initialValues.blobDownloadConcurrency =
        current?.blobDownloadConcurrency || "";
    }
    return _initialValues;
  }, [current]);
  const formSchema = useMemo(
    () => createBackupStorageAdvancedSettingSchema(intl, maxSettingCapacity),
    [intl, maxSettingCapacity],
  );
  const form = useForm<BackupStorageAdvancedSettingValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const onOk = (data: BackupStorageAdvancedSettingValues) => {
    setVisible?.(false);
    onSubmit(data);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      widthClassName="w-150"
      title={intl.formatMessage({
        id: "modify.advanced.config",
        defaultMessage: "Modify Advanced Settings",
      })}
      resourceName={resourceName}
    >
      <Form {...form}>
        <FieldStack>
          <InputUnitField
            form={form}
            name="reservedCapacity"
            label={intl.formatMessage({
              id: "backupStorage.reservedCapacity",
              defaultMessage: "Reserved Capacity",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backupStorage.field.reservedCapacity.tooltip",
                  defaultMessage: `### Reserved Capacity for Image Storage

The reserved storage space for an image storage when it is being used. Default is 1GB, unit is KB/MB/GB/TB.`,
                })}
              </ReactMarkdown>
            }
            required
            unitList={unitList}
            className="w-20"
          />
          <InputNumberField
            form={form}
            name="blobUploadConcurrency"
            label={intl.formatMessage({
              id: "imageStorage.blob.upload.concurrency",
              defaultMessage: "Image Blob Upload Concurrency",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backupStorage.field.blobUploadConcurrency.tooltip",
                  defaultMessage: `### Image Blob Upload Concurrency

1. Specify the blob upload concurrency when you upload an image. Default: 1. Valid values: 1 to 16. Increasing blob download concurrency increases the efficiency of cloning virtual machines and creating images.

2. To set a blob upload concurrency, take the network bandwidth, storage medium, and CPU cores into consideration. A higher concurrency does not necessarily equal a higher image upload speed in some scenarios. We recommend that you set the concurrency to 2 if you use a gigabit network and 4-8 if you use a 10-gigabit network. If you use a tape library as the image storage medium, we recommend that you set the concurrency as 1.`,
                })}
              </ReactMarkdown>
            }
            required
            valueMode="string"
            className="w-20"
            suffix={
              intl.locale === "zh-CN"
                ? intl.formatMessage({ id: "count", defaultMessage: " " })
                : undefined
            }
          />
          <InputNumberField
            form={form}
            name="blobDownloadConcurrency"
            label={intl.formatMessage({
              id: "imageStorage.blob.download.concurrency",
              defaultMessage: "Image Blob Download Concurrency",
            })}
            labelTooltip={
              <ReactMarkdown>
                {intl.formatMessage({
                  id: "backupStorage.field.blobDownloadConcurrency.tooltip",
                  defaultMessage: `### Image Blob Download Concurrency

1. Specify the blob download concurrency when you download an image. Default: 1. Valid values: 1 to 16. Increasing blob download concurrency increases the efficiency of creating virtual machines in certain scenarios.

2. To set a blob download concurrency, take the network bandwidth, storage medium, and CPU cores into consideration. A higher concurrency does not necessarily equal a higher image download speed in some scenarios. We recommend that you set the concurrency to 2 if you use a gigabit network and 4-8 if you use a 10-gigabit network. `,
                })}
              </ReactMarkdown>
            }
            required
            valueMode="string"
            className="w-20"
            suffix={
              intl.locale === "zh-CN"
                ? intl.formatMessage({ id: "count", defaultMessage: " " })
                : undefined
            }
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
