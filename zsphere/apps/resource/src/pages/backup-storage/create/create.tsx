import { gql } from "@apollo/client";
import { Button, DialogFooter } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { Steps, Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { BackupStorageType } from "@zstack/zsphere-types";
import { Encrypt, parseNumber } from "@zstack/zsphere-utils";
import { cloneDeep as _cloneDeep, pick as _pick } from "lodash-es";
import type { FC } from "react";
import React, { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import AdvancedConfig from "./advanced-config";
import BasicConfig from "./basic-config";
import ConfigInfo from "./config-info";
import BackupStorageCreateContext from "./context";
import DiskConfig from "./disk-config";
import { getInitialValues } from "./utils";

import styles from "./style.module.less";

const addImageStoreBackupStorage = gql`
  mutation addImageStoreBackupStorage(
    $input: AddImageStoreBackupStorageInput!
  ) {
    addImageStoreBackupStorage(input: $input) {
      actionId
    }
  }
`;

const addCephBackupStorage = gql`
  mutation addCephBackupStorage($input: AddCephBackupStorageInput!) {
    addCephBackupStorage(input: $input) {
      actionId
    }
  }
`;

const testHostConnection = gql`
  mutation testConnection($input: TestConnectionInput!) {
    testConnection(input: $input) {
      actionId
    }
  }
`;

interface IProps {
  onCancel: () => void;
}

const validateCephFieldsList = [
  "name",
  "monitorNode",
  "dataNetwork",
  "poolName",
  "reservedCapacity",
  "blobUploadConcurrency",
  "blobDownloadConcurrency",
];

const Create: FC<IActionWrapperProps<any> & IProps> = ({
  visible,
  setVisible,
  source: _source = {},
  onCancel,
}) => {
  const intl = useIntl();
  const [source, setSource] = useState<any>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const doAction = useAction();
  const isImageStore: boolean = [
    BackupStorageType.ImageStoreBackupStorage,
  ].includes(source?.createWay);

  const initialValues = getInitialValues(source);

  useEffect(() => {
    if (_source) {
      setSource({ ..._source, currentStep });
    }
    if (!visible) {
      setCurrentStep(0);
      form.resetFields();
    }
  }, [_source, currentStep, visible]);

  const submitHandle = useCallback(async () => {
    let isValidate = true;
    try {
      if (_source?.createWay === BackupStorageType.Ceph) {
        await form.validateFields(validateCephFieldsList);
      } else {
        await form.validateFields();
      }
    } catch {
      isValidate = false;
    }
    if (!isValidate) {
      return;
    }
    const params = _cloneDeep(form.getFieldsValue());
    let payload;
    const monUrls = [] as Array<string>;
    const systemTags = [];
    switch (params.type) {
      case BackupStorageType.ImageStoreBackupStorage:
        payload = _pick(params, [
          "zoneUuid",
          "name",
          "description",
          "type",
          "hostname",
          "url",
          "importImages",
          "sshPort",
          "username",
          "password",
          "systemTags",
          "blobUploadConcurrency",
          "blobDownloadConcurrency",
        ]);
        if (params?.syncImageNetwork) {
          systemTags.push(`sync::network::cidr::${params.syncImageNetwork}`);
        }
        payload = {
          ...payload,
          blockDevicePath: params?.freeDisk && params?.freeDisk?.[0]?.name,
        };
        break;
      case BackupStorageType.Ceph:
        payload = _pick(params, [
          "zoneUuid",
          "name",
          "description",
          "type",
          "poolName",
          "monUrls",
          "systemTags",
          "blobUploadConcurrency",
          "blobDownloadConcurrency",
        ]);
        params?.mons?.forEach((item: any) => {
          monUrls.push(
            `${item.sshUsername}:${item.sshPassword}@${item.hostname}:${item.sshPort}`,
          );
        });
        payload.monUrls = monUrls;
        break;
      default:
        payload = params;
        break;
    }
    if (params?.dataNetwork) {
      systemTags.push(
        `backupStorage::data::network::cidr::${params.dataNetwork}`,
      );
    }
    // 高级设置
    if (params?.reservedCapacity) {
      const { number = 1, unit = "GB" } = params?.reservedCapacity ?? {};
      payload.reservedCapacity = parseNumber(number, unit)?.toString();
    }
    if (params?.blobUploadConcurrency) {
      payload.blobUploadConcurrency =
        String(params?.blobUploadConcurrency) ||
        initialValues?.blobUploadConcurrency;
    }
    if (params?.blobDownloadConcurrency) {
      payload.blobDownloadConcurrency =
        String(params?.blobDownloadConcurrency) ||
        initialValues?.blobDownloadConcurrency;
    }

    let fn;
    if (params?.type === "Ceph") {
      fn = addCephBackupStorage;
    } else {
      fn = addImageStoreBackupStorage;
    }

    doAction({
      mutation: fn,
      payload: { ...payload, systemTags },
      name: intl.formatMessage({
        id: "add.backupStorage",
        defaultMessage: "Add Image Storage",
      }),
      total: 1,
      type: "BackupStorage",
      onFinish: () => {},
    });

    setVisible(false);
    onCancel();
  }, [_source, doAction, form, initialValues, intl, onCancel, setVisible]);

  const testConnection = async () => {
    form.setFieldsValue({ testConnError: "" });
    await form.validateFields([
      "name",
      "description",
      "hostname",
      "sshPort",
      "username",
      "password",
    ]);
    setLoading(true);
    const { hostname, sshPort, username, password } = form.getFieldsValue([
      "password",
      "hostname",
      "sshPort",
      "username",
    ]);

    const payload = {
      hostName: hostname,
      sshPort: Number(sshPort),
      username,
      password: Encrypt(password),
    };

    doAction({
      mutation: testHostConnection,
      payload,
      type: "backupStorage",
      name: intl.formatMessage({
        id: "test.connection",
        defaultMessage: "Test Connection",
      }),
      total: 1,
      onFinish: (result) => {
        setLoading(false);
        if (result?.inventory?.success) {
          setCurrentStep((value) => value + 1);
        } else {
          form.setFieldsValue({
            testConnError: intl.formatMessage({
              id: "add.backup.storage.error.connection.fail",
              defaultMessage: "Connection Failed. Check your configurations.",
            }),
          });
        }
      },
    });
  };

  const handleValuesChange = (changedValues: any, values: any) => {
    if (
      values.testConnError &&
      ("password" in changedValues ||
        "hostname" in changedValues ||
        "sshPort" in changedValues ||
        "username" in changedValues)
    ) {
      form.setFieldsValue({ testConnError: "" });
    }
  };

  const footer = (
    <DialogFooter className="gap-2">
      <Button
        variant="subtle"
        onClick={() => {
          onCancel();
        }}
      >
        {intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
      </Button>
      {isImageStore && currentStep > 0 && (
        <Button
          variant="secondary"
          icon={<Icon type="arrow-ios-left" />}
          onClick={() => setCurrentStep((value) => value - 1)}
        >
          {intl.formatMessage({ id: "previous", defaultMessage: "Back" })}
        </Button>
      )}
      {isImageStore && currentStep < 1 ? (
        <Button
          loading={loading}
          disabled={loading}
          variant="primary"
          onClick={async () => {
            testConnection();
          }}
        >
          {intl.formatMessage({ id: "next", defaultMessage: "Next" })}
          <Icon type="arrow-ios-right" style={{ marginLeft: 4 }} />
        </Button>
      ) : (
        <Button variant="primary" onClick={submitHandle}>
          {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
        </Button>
      )}
    </DialogFooter>
  );

  return (
    <DialogForm
      form={form}
      title={intl.formatMessage({
        id: "add.backupStorage",
        defaultMessage: "Add Image Storage",
      })}
      visible={visible}
      setVisible={setVisible}
      widthClassName="w-150"
      onCancel={onCancel}
      className={styles.createBackupStorage}
      bodyClassName="p-0"
      footer={footer}
    >
      <BackupStorageCreateContext.Provider value={{ source, setSource }}>
        {isImageStore && (
          <div className={styles.stepsWrapper}>
            <Steps direction="horizontal" current={currentStep}>
              <Steps.Step
                title={intl.formatMessage({
                  id: "basic.config",
                  defaultMessage: "Basic Configuration",
                })}
              />
              <Steps.Step
                title={intl.formatMessage({
                  id: "storage.config",
                  defaultMessage: "Storage Configuration",
                })}
              />
            </Steps>
          </div>
        )}
        <Form
          form={form}
          initialValues={initialValues}
          onValuesChange={handleValuesChange}
        >
          <div className={styles.formWrapper}>
            <div style={{ display: currentStep === 1 ? "none" : "block" }}>
              <BasicConfig />
              <ConfigInfo form={form} />
              {!isImageStore && <AdvancedConfig form={form} />}
            </div>
            <div
              style={{
                display: isImageStore && currentStep === 1 ? "block" : "none",
              }}
            >
              <DiskConfig form={form} />
              <AdvancedConfig form={form} />
            </div>
          </div>
        </Form>
      </BackupStorageCreateContext.Provider>
    </DialogForm>
  );
};

export default Create;
